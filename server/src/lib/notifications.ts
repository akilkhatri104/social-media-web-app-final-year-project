import { and, eq, isNull } from 'drizzle-orm';
import { db } from './db/client.ts';
import { user } from './auth-schema.ts';
import { notification, notificationPreference, post } from './db/schema.ts';
import mailSender from './mailSender.ts';

type NotificationType = 'like' | 'comment' | 'repost' | 'follow' | 'quote' | 'mention';

const defaultNotificationPreferences = {
  inAppLikes: true,
  inAppComments: true,
  inAppReposts: true,
  inAppFollows: true,
  inAppQuotes: true,
  inAppMentions: true,
  emailEnabled: false,
  emailLikes: false,
  emailComments: true,
  emailReposts: false,
  emailFollows: true,
  emailQuotes: true,
  emailMentions: true,
};

const typeToInAppSetting: Record<NotificationType, keyof typeof defaultNotificationPreferences> = {
  like: 'inAppLikes',
  comment: 'inAppComments',
  repost: 'inAppReposts',
  follow: 'inAppFollows',
  quote: 'inAppQuotes',
  mention: 'inAppMentions',
};

const typeToEmailSetting: Record<NotificationType, keyof typeof defaultNotificationPreferences> = {
  like: 'emailLikes',
  comment: 'emailComments',
  repost: 'emailReposts',
  follow: 'emailFollows',
  quote: 'emailQuotes',
  mention: 'emailMentions',
};

function getNotificationCopy(type: NotificationType) {
  switch (type) {
    case 'like':
      return { subject: 'New like on your post', action: 'liked your post' };
    case 'comment':
      return { subject: 'New reply to your post', action: 'replied to your post' };
    case 'repost':
      return { subject: 'Your post was reposted', action: 'reposted your post' };
    case 'follow':
      return { subject: 'You have a new follower', action: 'started following you' };
    case 'quote':
      return { subject: 'Your post was quoted', action: 'quoted your post' };
    case 'mention':
      return { subject: 'You were mentioned', action: 'mentioned you in a post' };
  }
}

async function sendNotificationEmail({
  recipientId,
  actorId,
  type,
  postId,
}: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: number;
}) {
  const [recipient, actor, relatedPost] = await Promise.all([
    db.query.user.findFirst({
      where: eq(user.id, recipientId),
      columns: { email: true, name: true },
    }),
    db.query.user.findFirst({
      where: eq(user.id, actorId),
      columns: { name: true, username: true, displayUsername: true },
    }),
    postId
      ? db.query.post.findFirst({
          where: eq(post.id, postId),
          columns: { content: true },
        })
      : Promise.resolve(null),
  ]);

  if (!recipient?.email || !actor) return;

  const copy = getNotificationCopy(type);
  const actorName = actor.name || actor.displayUsername || actor.username || 'Someone';
  const postPreview = relatedPost?.content
    ? `<p style="margin-top:16px;color:#666;">"${relatedPost.content.slice(0, 140)}${relatedPost.content.length > 140 ? '...' : ''}"</p>`
    : '';

  await mailSender(
    recipient.email,
    copy.subject,
    `
      <p>Hi ${recipient.name || 'there'},</p>
      <p><strong>${actorName}</strong> ${copy.action}.</p>
      ${postPreview}
      <p style="margin-top:16px;">Open the app to view the full activity.</p>
    `,
  );
}

export async function createNotificationOnce({
  recipientId,
  actorId,
  type,
  postId,
}: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: number;
}) {
  if (recipientId === actorId) return;

  const preferences = await db.query.notificationPreference.findFirst({
    where: eq(notificationPreference.userId, recipientId),
  });

  const resolvedPreferences = preferences
    ? {
        ...defaultNotificationPreferences,
        ...preferences,
      }
    : defaultNotificationPreferences;

  const shouldCreateInAppNotification = resolvedPreferences[typeToInAppSetting[type]];
  const shouldSendEmail =
    resolvedPreferences.emailEnabled && resolvedPreferences[typeToEmailSetting[type]];

  if (shouldCreateInAppNotification) {
    const existing = await db.query.notification.findFirst({
      where: and(
        eq(notification.recipientId, recipientId),
        eq(notification.actorId, actorId),
        eq(notification.type, type),
        postId ? eq(notification.postId, postId) : isNull(notification.postId),
      ),
      columns: { id: true },
    });

    if (!existing) {
      await db.insert(notification).values({
        recipientId,
        actorId,
        type,
        postId,
      });
    }
  }

  if (shouldSendEmail) {
    await sendNotificationEmail({
      recipientId,
      actorId,
      type,
      ...(postId ? { postId } : {}),
    });
  }
}
