1. Refactor feed post loading

- Add a postWithFeedRelations() helper in server/src/controllers/feed.controller.ts.
- Replace duplicated with: { ... } relation blocks in Following and For You queries.
- Keep DTO output shape unchanged.

2. Add optional session support for For You

- Import auth into feed.controller.ts.
- Inside getSimpleForYouFeed, call auth.api.getSession({ headers: req.headers }).
- Treat missing session as guest mode, not an error.
- Keep /api/feed/for-you public in feed.router.ts.

3. Fetch viewer context for logged-in users

- Load IDs of users the viewer follows.
- Load posts the viewer liked.
- Load posts the viewer bookmarked.
- Load posts the viewer reposted.
- Load comments/replies created by the viewer.
- Load posts created by the viewer.
- Build sets for:
- followedUserIds
- interactedPostIds
- interactedAuthorIds
- interestedHashtags

4. Fetch candidate posts

- Query recent top-level posts with parentPostId IS NULL.
- Include author, likes, comments, reposts, quotePosts, media, postHashtags, quotedPost, and parentPost.
- Start with a reasonable limit, for example 200.
- Order by createdAt DESC before scoring.

5. Apply visibility filtering

- Always allow public posts.
- Allow the viewer’s own posts.
- Allow followers posts only when post.userId is in followedUserIds.
- For guests, only allow public posts.

6. Score each candidate post

- Calculate post age in hours.
- Add recency score:
  Math.max(0, 72 - ageHours)
- Add engagement score:
  likeCount _ 2 + commentCount _ 3 + repostCount \* 2
- For logged-in users, add personalization boosts:
  +25 if author is followed
  +18 if author is an interacted author
  +12 per matching hashtag, capped at 36
  +8 if followed users engaged with the post
  -10 if viewer owns the post
  -15 if viewer already interacted with the post

7. Sort and limit results

- Sort scored posts by score DESC.
- Use createdAt DESC as the tie breaker.
- Limit final output to a practical amount, for example 50.

8. Return the existing feed format

- Map each result to:
  {
  itemType: 'post',
  createdAt: post.createdAt,
  post: toPostDto(post)
  }
- Do not expose scores in the API response for now.
- Keep client FeedItem types unchanged.

9. Decide how to handle reposts

- Simple first version: keep For You focused on original posts only.
- Optional follow-up: include repost items and score them using the original post plus reposting user context.
- Keep Following feed repost behavior unchanged.

10. Verify server correctness

- Run npm run build in server.
- Run npm run lint in server if build succeeds.
- Fix any TypeScript or lint issues.

11. Manual test cases

- Guest user can load For You.
- Logged-in user can load For You.
- Following feed still works.
- Posts with hashtags the user liked/bookmarked/reposted/commented on rank higher.
- Posts from followed users rank higher.
- Old low-engagement posts rank lower.
- followers visibility posts are hidden from unrelated users.

12. Optional improvements after MVP

- Add pagination with limit and cursor.
- Add a lightweight recommendationReason field for debugging.
- Add database indexes for scoring/filtering if feed queries become slow.
- Add a dedicated user-interest table if recommendations need to scale.
