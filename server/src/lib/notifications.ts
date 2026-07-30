import { and, eq, isNull } from 'drizzle-orm';
import { db } from './db/client.ts';
import { notification } from './db/schema.ts';

type NotificationType = 'like' | 'comment' | 'repost' | 'follow' | 'quote';

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

  const existing = await db.query.notification.findFirst({
    where: and(
      eq(notification.recipientId, recipientId),
      eq(notification.actorId, actorId),
      eq(notification.type, type),
      postId ? eq(notification.postId, postId) : isNull(notification.postId),
    ),
    columns: { id: true },
  });

  if (existing) return;

  await db.insert(notification).values({
    recipientId,
    actorId,
    type,
    postId,
  });
}
