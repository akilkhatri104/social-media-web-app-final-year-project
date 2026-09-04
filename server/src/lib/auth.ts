import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/client.js';
import * as authSchema from './auth-schema.js';
import { emailOTP, username } from 'better-auth/plugins';
import mailSender from './mailSender.ts';
import { AppError } from '../middlewares/errorHandler.ts';

const frontendURL = process.env.FRONTEND_URL!;
const backendURL = process.env.BACKEND_URL!;
const isSecureOrigin = frontendURL.startsWith('https://');

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies: isSecureOrigin,
    defaultCookieAttributes: {
      secure: isSecureOrigin,
      sameSite: isSecureOrigin ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    },
  },
  baseURL: backendURL,
  trustedOrigins: [frontendURL],
  user: {
    additionalFields: {
      bio: {
        type: 'string',
      },
    },
  },
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          let res;
          if (type === 'email-verification') {
    res = await mailSender(
    email,
    'Email Verification OTP',
    `
    <p>
    Dear User, <br/>
    Here is your OTP for email verification <br/>
    <strong>${otp}</strong> <br/>
    Thank You!
    </p>
    `,
  );
} else if (type === 'sign-in') {
  res = await mailSender(
    email,
    'Login Verification OTP',
    `
    <p>
    Dear User, <br/>
    Here is your OTP to complete login verification <br/>
    <strong>${otp}</strong> <br/>
    Thank You!
    </p>
    `,
  );
} else {
  res = await mailSender(
    email,
    'Forget Password OTP',
    `
    <p>
    Dear User, <br/>
    Here is your OTP for reseting password <br/>
    <strong>${otp}</strong> <br/>
    Thank You!
    </p>
    `,
  );
}
          if (!res) {
            throw new AppError();
          }
        } catch (error) {
          console.error('sendVerificationOTP BetterAuth :: ', error);
          throw new AppError();
        }
      },
    }),
  ],
});
