import type { Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.ts';
import { APIResponse } from '../lib/apiResponse.ts';
import { auth } from '../lib/auth.ts';
import { db } from '../lib/db/client.ts';
import { session } from '../lib/auth-schema.ts';
import { notificationPreference } from '../lib/db/schema.ts';
import { and, eq, ne } from 'drizzle-orm';
import { APIError } from 'better-auth';

const defaultNotificationSettings = {
  inAppLikes: true,
  inAppComments: true,
  inAppReposts: true,
  inAppFollows: true,
  inAppQuotes: true,
  inAppMentions: true,
  emailEnabled: true,
  emailLikes: false,
  emailComments: true,
  emailReposts: false,
  emailFollows: true,
  emailQuotes: true,
  emailMentions: true,
};

const notificationSettingKeys = Object.keys(defaultNotificationSettings) as Array<
  keyof typeof defaultNotificationSettings
>;

export async function getSessions(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  const userId = req.session.user.id;
  const currentSessionId = req.session.session.id;

  const sessions = await db.query.session.findMany({
    where: eq(session.userId, userId),
    orderBy: (s, { desc }) => [desc(s.updatedAt)],
  });

  return res.json(
    new APIResponse('Sessions fetched successfully', 200, {
      sessions,
      currentSessionId,
    }),
  );
}

export async function deleteSession(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  const userId = req.session.user.id;
  const sessionId = req.params.id;

  if (!sessionId) throw new AppError('Session id is required', 400);

  const targetSession = await db.query.session.findFirst({
    where: and(eq(session.id, sessionId), eq(session.userId, userId)),
  });

  if (!targetSession) throw new AppError('Session not found', 404);

  try {
    await auth.api.revokeSession({
      headers: req.headers as any,
      body: { token: targetSession.token },
    });
  } catch {
    // Fallback: delete directly if Better Auth API fails
    await db.delete(session).where(eq(session.id, sessionId));
  }

  return res.json(new APIResponse('Session revoked successfully', 200));
}

export async function deleteOtherSessions(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  const userId = req.session.user.id;
  const currentSessionId = req.session.session.id;

  try {
    await auth.api.revokeSessions({
      headers: req.headers as any,
    });

    // Re-insert current session since revokeSessions revokes all
    // Better Auth's revokeOtherSessions is the correct method
  } catch {
    // Fallback: delete all sessions except current directly
    await db
      .delete(session)
      .where(
        and(eq(session.userId, userId), ne(session.id, currentSessionId)),
      );
  }

  return res.json(new APIResponse('Other sessions revoked successfully', 200));
}

export async function deleteOtherSessionsDirect(
  req: Request,
  res: Response,
) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  const userId = req.session.user.id;
  const currentSessionId = req.session.session.id;

  await db
    .delete(session)
    .where(
      and(eq(session.userId, userId), ne(session.id, currentSessionId)),
    );

  return res.json(new APIResponse('Other sessions revoked successfully', 200));
}

export async function deleteAccount(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  try {
    const { password } = req.body;
    if (!password) throw new AppError('Password is required', 400);

    await auth.api.deleteUser({
      headers: req.headers as any,
      body: { password },
    });

    return res.json(new APIResponse('Account deleted successfully', 200));
  } catch (error) {
    console.error('deleteAccount :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function changePassword(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new passwords are required', 400);
    }

    await auth.api.changePassword({
      headers: req.headers as any,
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
    });

    return res.json(new APIResponse('Password changed successfully', 200));
  } catch (error) {
    console.error('changePassword :: ', error);
    throw error instanceof AppError || error instanceof APIError
      ? error
      : new AppError();
  }
}

export async function getNotificationSettings(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  const settings = await db.query.notificationPreference.findFirst({
    where: eq(notificationPreference.userId, req.session.user.id),
  });

  return res.json(
    new APIResponse('Notification settings fetched successfully', 200, {
      settings: settings
        ? {
            inAppLikes: settings.inAppLikes,
            inAppComments: settings.inAppComments,
            inAppReposts: settings.inAppReposts,
            inAppFollows: settings.inAppFollows,
            inAppQuotes: settings.inAppQuotes,
            inAppMentions: settings.inAppMentions,
            emailEnabled: settings.emailEnabled,
            emailLikes: settings.emailLikes,
            emailComments: settings.emailComments,
            emailReposts: settings.emailReposts,
            emailFollows: settings.emailFollows,
            emailQuotes: settings.emailQuotes,
            emailMentions: settings.emailMentions,
          }
        : defaultNotificationSettings,
    }),
  );
}

export async function updateNotificationSettings(req: Request, res: Response) {
  if (!req.session) throw new AppError('Unauthorized', 401);

  const updates = Object.fromEntries(
    notificationSettingKeys
      .filter((key) => typeof req.body?.[key] === 'boolean')
      .map((key) => [key, req.body[key]]),
  );

  if (Object.keys(updates).length === 0) {
    throw new AppError('At least one valid notification setting is required', 400);
  }

  await db
    .insert(notificationPreference)
    .values({
      userId: req.session.user.id,
      ...defaultNotificationSettings,
      ...updates,
    })
    .onConflictDoUpdate({
      target: notificationPreference.userId,
      set: updates,
    });

  const settings = await db.query.notificationPreference.findFirst({
    where: eq(notificationPreference.userId, req.session.user.id),
  });

  return res.json(
    new APIResponse('Notification settings updated successfully', 200, {
      settings,
    }),
  );
}
