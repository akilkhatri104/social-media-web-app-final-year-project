import { auth } from '../lib/auth.js';
import { AppError } from '../middlewares/errorHandler.js';
import { type Request, type Response } from 'express';
import { APIResponse } from '../lib/apiResponse.ts';
import { deleteFromCloudinary, uploadToCloudinary } from '../lib/cloudinary.ts';
import { db } from '../lib/db/client.ts';
import { user } from '../lib/auth-schema.ts';
import { eq, and, not, or, ilike, count, gte } from 'drizzle-orm';
import { APIError } from 'better-auth';
import { authRiskEvent, securityQuestion } from '../lib/db/schema.ts';
import { assessRisk } from '../lib/riskAssessment.ts';
import {
  markPendingMFA,
  completeMFA,
  isPendingMFA,
} from '../lib/pendingMFA.ts';
import { session } from "../lib/auth-schema.ts";
import { assessMLRisk } from '../lib/mlRiskAssessment.js';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export async function me(req: Request, res: Response) {
  if (!req.session?.user) {
    throw new AppError('User not logged in', 401);
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, req.session.user.id),
  });

  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  return res.json(
    new APIResponse('User session fetched successfully', 200, {
      ...req.session,
      user: currentUser,
    }),
  );
}



export async function signin(req: Request, res: Response) {
  let riskAssessment = assessRisk({
    failedAttempts: 0,
    newDevice: false,
    newIP: false,
    unusualLoginTime: false,
  });

  let eventUserId: string | null = null;
  let failedAttempts = 0;
  let newIP = false;
  let newDevice = false;
  let unusualLoginTime = false;

  try {
    const { password, username }: { password: string; username: string } =
      req.body;

    if (!username) {
      throw new AppError('Email or Username are required', 400);
    }

    if (!password) {
      throw new AppError('Password is required', 400);
    }

    const existingUser = await db.query.user.findFirst({
      where: or(
        eq(user.username, username.toLowerCase()),
        eq(user.email, username.toLowerCase()),
      ),
    });

    eventUserId = existingUser?.id ?? null;

    const ipAddress = req.ip ?? null;
    const userAgent = req.headers['user-agent'] ?? null;

    // Count consecutive failed authentication attempts.
    if (eventUserId) {
      const recentEvents = await db
        .select({
          success: authRiskEvent.success,
        })
        .from(authRiskEvent)
        .where(eq(authRiskEvent.userId, eventUserId))
        .orderBy(authRiskEvent.createdAt);

      for (let i = recentEvents.length - 1; i >= 0; i--) {
        if (recentEvents[i]?.success === false) {
          failedAttempts++;
        } else {
          break;
        }
      }
    }

    // Compare current login context with the user's first
    // recorded authentication context.
    if (eventUserId) {
      const previousEvents = await db
        .select({
          ipAddress: authRiskEvent.ipAddress,
          userAgent: authRiskEvent.userAgent,
        })
        .from(authRiskEvent)
        .where(eq(authRiskEvent.userId, eventUserId))
        .orderBy(authRiskEvent.createdAt)
        .limit(1);

      const previous = previousEvents[0];

      if (previous) {
        newIP =
          Boolean(previous.ipAddress) &&
          Boolean(ipAddress) &&
          previous.ipAddress !== ipAddress;

        newDevice =
          Boolean(previous.userAgent) &&
          Boolean(userAgent) &&
          previous.userAgent !== userAgent;
      }
    }

    const currentHour = new Date().getHours();
    unusualLoginTime = currentHour >= 0 && currentHour < 6;

    // Rule-based risk assessment.
    riskAssessment = assessRisk({
      failedAttempts,
      newDevice,
      newIP,
      unusualLoginTime,
    });

    // ML-based risk assessment.
    const mlRiskAssessment = assessMLRisk({
      failedAttempts,
      newIp: newIP,
      newDevice,
      unusualLoginTime,
    });

    console.log('ML RISK:', {
      level: mlRiskAssessment.level,
      confidence: mlRiskAssessment.confidence,
    });

    console.log('LOGIN RISK:', {
      username,
      failedAttempts,
      newDevice,
      newIP,
      unusualLoginTime,
      ...riskAssessment,
    });

    let response;

    // Authenticate the password FIRST.
    // HIGH risk no longer blocks before password verification.
    if (
      !username.match(
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*)?/g,
      )
    ) {
      response = await auth.api.signInUsername({
        returnHeaders: true,
        body: { username, password },
      });
    } else {
      response = await auth.api.signInEmail({
        returnHeaders: true,
        body: { email: username, password },
      });
    }

    const setCookies = response.headers.getSetCookie();

    if (setCookies.length) {
      res.setHeader('Set-Cookie', setCookies);
    }

    /*
 * HIGH RISK
 *
 * Password is correct, but the authentication context is risky.
 * Require the user's configured security question.
 *
 * Existing users without a security question fall back to
 * email OTP so they are not locked out.
 */
if (riskAssessment.level === 'HIGH') {
  const sessionToken = response.response?.token;

  if (!sessionToken) {
    throw new AppError(
      'Unable to start security verification',
      500,
    );
  }

  const sessionRecord = await db.query.session.findFirst({
    where: eq(session.token, sessionToken),
  });

  if (!sessionRecord) {
    throw new AppError(
      'Unable to start security verification',
      500,
    );
  }

  markPendingMFA(sessionRecord.id);

  const configuredQuestion = eventUserId
    ? await db.query.securityQuestion.findFirst({
        where: eq(securityQuestion.userId, eventUserId),
      })
    : null;

  if (configuredQuestion) {
    return res.status(202).json(
      new APIResponse(
        'Additional security verification required',
        202,
        {
          securityChallengeRequired: true,
          challengeType: 'security-question',
          challengeQuestion: configuredQuestion.question,
          riskLevel: riskAssessment.level,
        },
      ),
    );
  }

  /*
   * No security question configured.
   * Fall back to email OTP for backwards compatibility.
   */
  const email = existingUser?.email;

  if (!email) {
    throw new AppError(
      'Email is required for security verification',
      400,
    );
  }

  const otpResponse = await auth.api.sendVerificationOTP({
    body: {
      email,
      type: 'sign-in',
    },
  });

  if (!otpResponse.success) {
    throw new AppError(
      'Unable to send security verification OTP',
      500,
    );
  }

  return res.status(202).json(
    new APIResponse(
      'Additional verification required',
      202,
      {
        mfaRequired: true,
        riskLevel: riskAssessment.level,
      },
    ),
  );
}
    /*
     * MEDIUM RISK
     *
     * Require email OTP.
     */
    if (riskAssessment.level === 'MEDIUM') {
      if (!eventUserId) {
        throw new AppError('Unable to start MFA verification', 500);
      }

      const sessionToken = response.response?.token;

      if (!sessionToken) {
        throw new AppError('Unable to start MFA verification', 500);
      }

      const sessionRecord = await db.query.session.findFirst({
        where: eq(session.token, sessionToken),
      });

      if (!sessionRecord) {
        throw new AppError('Unable to start MFA verification', 500);
      }

      markPendingMFA(sessionRecord.id);

      const email = existingUser?.email;

      if (!email) {
        throw new AppError(
          'Email is required for MFA verification',
          400,
        );
      }

      const otpResponse = await auth.api.sendVerificationOTP({
        body: {
          email,
          type: 'sign-in',
        },
      });

      if (!otpResponse.success) {
        throw new AppError('Unable to send MFA OTP', 500);
      }

      return res.status(202).json(
        new APIResponse(
          'Additional verification required',
          202,
          {
            mfaRequired: true,
            riskLevel: riskAssessment.level,
          },
        ),
      );
    }

    /*
     * LOW RISK
     *
     * Normal successful authentication.
     */
    await db.insert(authRiskEvent).values({
      userId: eventUserId,
      ipAddress,
      userAgent,
      success: true,
      failedAttempts,
      newIp: newIP,
      newDevice,
      unusualLoginTime,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
    });

    return res.status(200).json(
      new APIResponse('User signed in successfully', 200, {
        user: response.response?.user,
      }),
    );
  } catch (error) {
    console.error('signin :: ', error);

    try {
      const ipAddress = req.ip ?? null;
      const userAgent = req.headers['user-agent'] ?? null;

      await db.insert(authRiskEvent).values({
        userId: eventUserId,
        ipAddress,
        userAgent,
        success: false,
        failedAttempts: failedAttempts + 1,
        newIp: newIP,
        newDevice,
        unusualLoginTime,
        riskScore: riskAssessment.score,
        riskLevel: riskAssessment.level,
      });
    } catch (loggingError) {
      console.error(
        'signin risk event logging :: ',
        loggingError,
      );
    }

    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function verifySigninOTP(req: Request, res: Response) {
  try {
    const { otp } = req.body;

    if (!otp || otp.length !== 6) {
      throw new AppError('No or invalid OTP provided', 400);
    }

     const currentSession = await auth.api.getSession({
      headers: req.headers,
    });

    if (!currentSession) {
      throw new AppError('Login session not found', 401);
    }

    if (!isPendingMFA(currentSession.session.id)) {
      throw new AppError('No pending MFA verification', 400);
    }

    const email = currentSession.user.email;

    const result = await auth.api.checkVerificationOTP({
      body: {
        email,
        otp,
        type: 'sign-in',
      },
    });

    if (!result.success) {
      throw new AppError('OTP not valid', 400);
    }

completeMFA(currentSession.session.id);

await db.insert(authRiskEvent).values({
  userId: currentSession.user.id,
  ipAddress: req.ip ?? null,
  userAgent: req.headers['user-agent'] ?? null,
  success: true,
  failedAttempts: 0,
  newIp: false,
  newDevice: false,
  unusualLoginTime:
    new Date().getHours() >= 0 && new Date().getHours() < 6,
  riskScore: 0,
  riskLevel: 'LOW',
});

return res.status(200).json(
  new APIResponse(
    'MFA verification successful',
    200,
    {
      mfaVerified: true,
      user: currentSession.user,
    },
  ),
);

  } catch (error) {
    console.error('verifySigninOTP :: ', error);

    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function verifySecurityChallenge(
  req: Request,
  res: Response,
) {
  try {
    const { answer } = req.body;

    if (!answer || typeof answer !== 'string') {
      throw new AppError(
        'Security challenge answer is required',
        400,
      );
    }

    const currentSession = await auth.api.getSession({
      headers: req.headers,
    });

    if (!currentSession) {
      throw new AppError('Login session not found', 401);
    }

    if (!isPendingMFA(currentSession.session.id)) {
      throw new AppError(
        'No pending security verification',
        400,
      );
    }

    const configuredQuestion =
      await db.query.securityQuestion.findFirst({
        where: eq(
          securityQuestion.userId,
          currentSession.user.id,
        ),
      });

    if (!configuredQuestion) {
      throw new AppError(
        'Security question is not configured',
        400,
      );
    }

    const answerBuffer = Buffer.from(
      answer.trim().toLowerCase(),
      'utf8',
    );

    const saltBuffer = Buffer.from(
      configuredQuestion.answerSalt,
      'hex',
    );

    const expectedHash = Buffer.from(
      configuredQuestion.answerHash,
      'hex',
    );

    const actualHash = scryptSync(
      answerBuffer,
      saltBuffer,
      expectedHash.length,
    );

    if (
      actualHash.length !== expectedHash.length ||
      !timingSafeEqual(actualHash, expectedHash)
    ) {
      throw new AppError(
        'Incorrect security challenge answer',
        401,
      );
    }

    completeMFA(currentSession.session.id);

    await db.insert(authRiskEvent).values({
      userId: currentSession.user.id,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
      success: true,
      failedAttempts: 0,
      newIp: false,
      newDevice: false,
      unusualLoginTime:
        new Date().getHours() >= 0 &&
        new Date().getHours() < 6,
      riskScore: 0,
      riskLevel: 'LOW',
    });

    return res.status(200).json(
      new APIResponse(
        'Security verification successful',
        200,
        {
          securityVerified: true,
          user: currentSession.user,
        },
      ),
    );
  } catch (error) {
    console.error(
      'verifySecurityChallenge :: ',
      error,
    );

    throw error instanceof AppError ||
      error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function getSecurityQuestion(
  req: Request,
  res: Response,
) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in',
        401,
      );
    }

    const configuredQuestion =
      await db.query.securityQuestion.findFirst({
        where: eq(
          securityQuestion.userId,
          req.session.user.id,
        ),
      });

    return res.status(200).json(
      new APIResponse(
        'Security question fetched successfully',
        200,
        {
          configured: Boolean(configuredQuestion),
          question: configuredQuestion?.question ?? null,
        },
      ),
    );
  } catch (error) {
    console.error(
      'getSecurityQuestion :: ',
      error,
    );

    throw error instanceof AppError ||
      error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function setSecurityQuestion(
  req: Request,
  res: Response,
) {
  try {
    if (!req.session?.user) {
      throw new AppError(
        'User needs to be logged in',
        401,
      );
    }

    const { question, answer, currentPassword } = req.body;

if (
  typeof currentPassword !== 'string' ||
  !currentPassword.trim()
) {
  throw new AppError(
    'Current password is required',
    400,
  );
}

try {
  await auth.api.verifyPassword({
    body: {
      password: currentPassword,
    },
    headers: new Headers({
      cookie: req.headers.cookie ?? '',
    }),
  });
} catch {
  throw new AppError(
    'Incorrect current password',
    401,
  );
}
    if (
      typeof question !== 'string' ||
      !question.trim()
    ) {
      throw new AppError(
        'Security question is required',
        400,
      );
    }

    if (
      typeof answer !== 'string' ||
      !answer.trim()
    ) {
      throw new AppError(
        'Security answer is required',
        400,
      );
    }

    const normalizedAnswer = answer
      .trim()
      .toLowerCase();

    const salt = randomBytes(16);

    const answerHash = scryptSync(
      normalizedAnswer,
      salt,
      64,
    );

    const existingQuestion =
      await db.query.securityQuestion.findFirst({
        where: eq(
          securityQuestion.userId,
          req.session.user.id,
        ),
      });

    if (existingQuestion) {
      await db
        .update(securityQuestion)
        .set({
          question: question.trim(),
          answerHash: answerHash.toString('hex'),
          answerSalt: salt.toString('hex'),
          updatedAt: new Date(),
        })
        .where(
          eq(
            securityQuestion.userId,
            req.session.user.id,
          ),
        );
    } else {
      await db.insert(securityQuestion).values({
  userId: req.session.user.id,
  question: question.trim(),
  answerHash: answerHash.toString('hex'),
  answerSalt: salt.toString('hex'),
  updatedAt: new Date(),
});
    }

    return res.status(200).json(
      new APIResponse(
        'Security question saved successfully',
        200,
        {
          configured: true,
          question: question.trim(),
        },
      ),
    );
  } catch (error) {
    console.error(
      'setSecurityQuestion :: ',
      error,
    );

    throw error instanceof AppError ||
      error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function signup(req: Request, res: Response) {
  console.log('BODY ::: ', req.body);
  if (!req.body) {
    console.error('Request body is missing');
    throw new AppError('Request body is missing', 400);
  }
  try {
    const {
      email,
      password,
      name,
      username,
    }: { email: string; password: string; name: string; username: string } =
      req.body;
    if (!email || !password || !name || !username) {
      console.error('Email, Username, Password and Name are required');
      throw new AppError('Email, Password and Name are required', 400);
    }

    if (
      !email.match(
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
      )
    ) {
      throw new AppError('Email is not valid', 400);
    }

    if (!username.match(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim)) {
      throw new AppError(
        'Usernames can contain characters a-z, 0-9, underscores and periods. The username cannot start with a period nor end with a period. It must also not have more than one period sequentially. Max length is 30 chars.',
        400,
      );
    }

    if (
      !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
    ) {
      throw new AppError(
        `Password must contain: 
        - at least 8 characters
- must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number
- Can contain special characters`,
        400,
      );
    }
    console.log('Request body is valid');

    if (req.file && !req.file.mimetype.startsWith('image/')) {
      throw new AppError('Profile picture must be an image');
    }
    let imgUrl;
    if (req.file && req.file.mimetype.startsWith('image/')) {
      const result = await uploadToCloudinary(req.file.buffer);
      if (!result) {
        throw new AppError('Error while uploading profile image');
      }
      imgUrl = result.secure_url;
    }

    const response = await auth.api.signUpEmail({
      returnHeaders: true,
      body: { email, password, name, image: imgUrl, username, bio: '' },
    });

    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      console.log('COOKIES :: ', setCookies);
      res.setHeader('Set-Cookie', setCookies);
    }

    console.log('Response from sign up email:', response);
    return res
      .status(201)
      .json(
        new APIResponse('User signed up successfully', 201, response.response),
      );
  } catch (error) {
    console.error('signup :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const response = await auth.api.signOut({
      headers: req.headers,
      returnHeaders: true,
    });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      console.log('COOKIES :: ', setCookies);
      res.setHeader('Set-Cookie', setCookies);
    }
    return res
      .status(200)
      .json(new APIResponse('User logged out successfully', 200));
  } catch (error) {
    console.error('logout :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to update details', 401);
    }

    if (!req.body) {
      throw new AppError('Request body is empty', 400);
    }

    const { username, name, bio } = req.body;

    if (!username && !name && !bio && !req.file) {
      throw new AppError('No updated details provided', 400);
    }

    if (req.file && !req.file.mimetype.startsWith('image/')) {
      throw new AppError('Profile picture must be an image');
    }
    let imgUrl = undefined;
    if (req.file && req.file.mimetype.startsWith('image/')) {
      const result = await uploadToCloudinary(req.file.buffer);
      if (!result) {
        throw new AppError('Error while uploading new image');
      }
      imgUrl = result.secure_url;

      if (result.public_id && req.session.user.image) {
        await deleteFromCloudinary(req.session.user.image);
      }
    }

    // Better Auth's username plugin can flag the current user's own username
    // as a conflict, so settings updates write the profile fields directly.
    const currentUsername = (req.session.user as typeof user.$inferSelect)
      .username;
    const usernameChanged =
      username && username.toLowerCase() !== currentUsername?.toLowerCase();

    if (usernameChanged) {
      const existing = await db.query.user.findFirst({
        where: eq(user.username, username.toLowerCase()),
      });
      if (existing && existing.id !== req.session.user.id) {
        throw new AppError('Username is already taken', 409);
      }
    }

    const updatePayload: Partial<typeof user.$inferInsert> = {};
    if (name !== undefined) updatePayload.name = name;
    if (bio !== undefined) updatePayload.bio = bio;
    if (imgUrl !== undefined) updatePayload.image = imgUrl;
    if (usernameChanged) {
      updatePayload.username = username.toLowerCase();
      updatePayload.displayUsername = username;
    }

    const [userResult] = await db
      .update(user)
      .set(updatePayload)
      .where(eq(user.id, req.session.user.id))
      .returning();

    if (!userResult) {
      throw new AppError('Error while updating details', 500);
    }

    return res
      .status(200)
      .json(new APIResponse('User details updated', 200, { user: userResult }));
  } catch (error) {
    console.error('updateUser :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function sendEmailVerificationOTP(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to verify email', 401);
    }

    if (req.session.user.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    const response = await auth.api.sendVerificationOTP({
      body: {
        email: req.session.user.email,
        type: 'email-verification',
      },
    });

    if (!response.success) {
      throw new AppError('Error while sending email');
    }

    return res
      .status(200)
      .json(new APIResponse('Email verification OTP sent successfully', 200));
  } catch (error) {
    console.error('sendEmailVerificationOTP :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function verifyEmailVerificationOTP(req: Request, res: Response) {
  try {
    if (!req.body) {
      throw new AppError('Request body is empty', 400);
    }

    const { otp }: { otp: string } = req.body;
    if (!otp || otp.length !== 6) {
      throw new AppError('No or invalid OTP provided', 400);
    }
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to verify email', 401);
    }

    if (req.session.user.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    const isOTPValid = await auth.api.checkVerificationOTP({
      body: {
        email: req.session.user.email,
        otp,
        type: 'email-verification',
      },
    });

    if (!isOTPValid.success) {
      throw new AppError('OTP not valid', 400);
    }

    const response = await auth.api.verifyEmailOTP({
      body: {
        email: req.session.user.email,
        otp,
      },
      headers: req.headers,
      returnHeaders: true,
    });

    if (!response.response.status) {
      throw new AppError('Error while verifying email');
    }

    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      res.setHeader('Set-Cookie', setCookies);
    }

    return res
      .status(200)
      .json(
        new APIResponse('Email verified successfully', 200, response.response),
      );
  } catch (error) {
    console.error('verifyEmailVerificationOTP :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function sendForgetPasswordOTP(req: Request, res: Response) {
  try {
    if (!req.body) {
      throw new AppError('Request body is empty', 400);
    }

    const { email } = req.body;

    if (!email) {
      throw new AppError('Email not provided', 400);
    }

    const emailExists = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (emailExists.length === 0) {
      throw new AppError('No user found with provided email', 404);
    }

    const response = await auth.api.forgetPasswordEmailOTP({
      body: {
        email: email,
      },
    });

    if (!response.success) {
      throw new AppError('Error while sending email');
    }

    return res
      .status(200)
      .json(new APIResponse('Forget email OTP sent successfully', 200));
  } catch (error) {
    console.error('sendForgetPasswordOTP :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function verifyForgetPasswordOTP(req: Request, res: Response) {
  try {
    if (!req.body) {
      throw new AppError('Request body is empty', 400);
    }

    const { otp, password, email } = req.body;
    if (!otp || otp.length !== 6) {
      throw new AppError('No or invalid OTP provided', 400);
    }

    if (!password || !email) {
      throw new AppError('No password or email provided', 400);
    }

    const { success: isOTPValid } = await auth.api.checkVerificationOTP({
      body: {
        email: email,
        otp,
        type: 'forget-password',
      },
    });

    if (!isOTPValid) {
      throw new AppError('OTP not valid', 400);
    }

    const response = await auth.api.resetPasswordEmailOTP({
      body: {
        otp,
        password,
        email,
      },
    });

    if (!response.success) {
      throw new AppError('Error while reseting password');
    }

    return res
      .status(200)
      .json(new APIResponse('Password reset successfully', 200));
  } catch (error) {
    console.error('verifyForgetPasswordOTP :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function searchUsers(req: Request, res: Response) {
  try {
    if (!req.session?.user) {
      throw new AppError('User needs to be logged in to perform search', 401);
    }
    const myId = req.session.user.id;
    const queryStr = (req.query.q as string || '').trim();

    if (!queryStr) {
      return res
        .status(200)
        .json(new APIResponse('Users searched successfully', 200, []));
    }

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
      })
      .from(user)
      .where(
        and(
          not(eq(user.id, myId)),
          or(
            ilike(user.name, `%${queryStr}%`),
            ilike(user.username, `%${queryStr}%`)
          )
        )
      )
      .limit(20);

    return res
      .status(200)
      .json(new APIResponse('Users searched successfully', 200, users));
  } catch (error) {
    console.error('searchUsers :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}


export async function getUserByUsername(req: Request, res: Response) {
  try {
    const rawUsername = req.params.username;
    const username = typeof rawUsername === 'string' ? rawUsername.replace(/^@/, '').trim() : '';

    if (!username) {
      throw new AppError('Username is required', 400);
    }

    const result = await db.query.user.findFirst({
      where: or(
        eq(user.username, username),
        eq(user.displayUsername, username),
        ilike(user.username, username),
        ilike(user.displayUsername, username),
        ilike(user.name, username),
      ),
    });

    if (!result) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(
      new APIResponse('User fetched successfully', 200, {
        user: result,
      }),
    );
  } catch (error) {
    console.error('getUserByUsername :: ', error);
    throw error instanceof AppError ? error : new AppError();
  }
}
