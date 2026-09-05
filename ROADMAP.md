**# Social Media App Feature Roadmap**

**## Existing Tech Stack**

| Layer | Existing Tech / Tools |

|---|---|

| Frontend | React 19, React Router 7, TypeScript, Vite, TanStack Query, Axios |

| UI | Tailwind CSS 4, shadcn-style components, Radix/Base UI, Lucide icons, Sonner |

| Backend | Node.js, Express 5, TypeScript |

| Auth | Better Auth |

| Database | PostgreSQL/Neon, Drizzle ORM, Drizzle Kit |

| Media | Cloudinary |

| Email | Nodemailer/SMTP |

| Deployment | Vercel client, backend API deployment, Neon database |

**## Team Split**

| Person | Primary Ownership |

|---|---|

| Person 1 | Settings, auth/session management, account safety |

| Person 2 | Notifications, DMs foundation |

| Person 3 | Hashtags, Explore, Search |

| Person 4 | Recommendations, multi-tenancy, feed/security integration |

**## One-Month Timeline**

| Week | Goal |

|---|---|

| Week 1 | Database design, API contracts, route structure, multi-tenancy foundation |

| Week 2 | Core backend APIs and schema migrations |

| Week 3 | Frontend pages/components and integration |

| Week 4 | Recommendation tuning, tenant isolation audit, testing, bug fixes, polish |

**## Week 1: Planning And Foundation**

**### Shared Tasks**

| Task | Owner | Deadline |

|---|---|---|

| Finalize DB schema changes | All | Day 2 |

| Define API endpoints and response shapes | All | Day 2 |

| Add Drizzle migrations for new tables | Person 4 with support | Day 4 |

| Decide minimum viable scope for DMs | Person 2 | Day 4 |

| Define tenant model: university/institute table and `universityId` on users/posts | Person 4 | Day 5 |

**### New Database Tables Likely Needed**

| Feature | Tables / Fields |

|---|---|

| Settings | Use existing `user`, `session`, `account`; may add `deletedAt` or `isDeleted` if soft delete is preferred |

| Notifications | `notification`, possibly `notificationPreference` |

| DMs | `conversation`, `conversationMember`, `message` |

| Hashtags | `hashtag`, `postHashtag` |

| Explore/Search | mostly uses `post`, `user`, `hashtag`, interaction counts |

| Recommendation | `userActivity`, possibly computed from `like`, `bookmark`, `follow`, `postHashtag` |

| Multi-tenancy | `university`, `user.universityId`, `post.universityId` |

| Risk-Adaptive Authentication | `auth\_risk\_event` |

**## Person 1: Settings**

**### Scope**

Build a `/settings` section with account and security controls.

**### Features**

| Feature | Description |

|---|---|

| Settings page | Main settings layout with tabs/sections |

| Edit profile consolidation | Move existing profile settings under `/settings/profile` |

| Change password | Use Better Auth password APIs if available |

| Manage sessions | Show active sessions from Better Auth `session` table |

| Revoke sessions | Allow logging out from other devices |

| Delete account | Confirm password, delete or soft-delete user account |

| Notification preferences | Basic UI shell if Person 2 adds preferences |

| Risk-Adaptive Authentication | Assess login risk and dynamically require normal authentication, email OTP, or a user-configured security challenge |

**### Backend Tasks**

| Endpoint | Purpose |

|---|---|

| `GET /api/settings/sessions` | List current user sessions |

| `DELETE /api/settings/sessions/\:id` | Revoke one session |

| `DELETE /api/settings/sessions` | Revoke all other sessions |

| `DELETE /api/settings/account` | Delete account |

| Better Auth route | Change password if already supported by Better Auth |

| `POST /api/users/signin` | Perform authentication risk assessment during sign-in |

| `POST /api/users/signin/verify-otp` | Verify OTP for medium-risk sign-in |

| `POST /api/users/signin/verify-security` | Verify the user-configured security question for high-risk sign-in |

**### Frontend Tasks**

| Route | Purpose |

|---|---|

| `/settings` | Settings landing page |

| `/settings/profile` | Existing edit profile page |

| `/settings/security` | Password and sessions |

| `/settings/account` | Delete account |

| Sign-in flow | Display OTP verification for medium-risk authentication and the configured security question for high-risk authentication |

**### Risk Assessment**

The RAA prototype uses the following authentication signals:

| Signal | Description |

|---|---|

| Failed attempts | Consecutive unsuccessful authentication attempts |

| New IP | Login originates from a different IP address |

| New device | Login originates from a different user agent |

| Unusual login time | Login occurs between 00:00 and 05:59 |

| Risk Level | Authentication Response |

|---|---|

| LOW | Normal authentication |

| MEDIUM | Email OTP verification |

| HIGH | User-configured security question; email OTP fallback if none is configured |

The prototype also evaluates the same signals using Logistic Regression. The ML model currently runs in shadow mode and does not control the authentication decision. Security question answers are stored as salted `scrypt` hashes and changing the question requires the current password.

**### Deadline**

| Milestone | Date |

|---|---|

| Backend complete | End of Week 2 |

| Frontend complete | Middle of Week 3 |

| Tested/polished | Week 4 |

**## Person 2: Notifications And DMs**

**### Scope**

Implement notifications first, then basic one-to-one DMs.

**### Notification MVP**

| Event | Notification |

|---|---|

| User likes post | Notify post owner |

| User comments/replies | Notify parent post owner |

| User reposts | Notify original post owner |

| User follows | Notify followed user |

| User quotes post | Notify original post owner |

**### Backend Tasks**

| Endpoint | Purpose |

|---|---|

| `GET /api/notifications` | Fetch notifications |

| `PATCH /api/notifications/\:id/read` | Mark one as read |

| `PATCH /api/notifications/read-all` | Mark all as read |

| `DELETE /api/notifications/\:id` | Delete notification |

**### Integration Points**

Add notification creation inside:

| Existing Area | Event |

|---|---|

| `likes.controller.ts` | Like notification |

| `posts.controller.ts` | Comment/reply/quote notification |

| `reposts.controller.ts` | Repost notification |

| `follows.controller.ts` | Follow notification |

**### DM MVP**

| Feature | Description |

|---|---|

| One-to-one conversations | Start chat with another user |

| Message list | Chronological messages |

| Send message | Text-only initially |

| Read status | Basic `readAt` field |

| Tenant-safe DMs | Only allow DMs within same university |

**### Backend Endpoints**

| Endpoint | Purpose |

|---|---|

| `GET /api/conversations` | List conversations |

| `POST /api/conversations` | Start/find one-to-one conversation |

| `GET /api/conversations/\:id/messages` | Get messages |

| `POST /api/conversations/\:id/messages` | Send message |

| `PATCH /api/conversations/\:id/read` | Mark messages read |

**### Frontend Routes**

| Route | Purpose |

|---|---|

| `/notifications` | Notification inbox |

| `/messages` | Conversation list |

| `/messages/\:id` | Chat screen |

**### Future Scope**

| Feature | Status |

|---|---|

| Group chats | Future |

| Voice/video calls | Future |

| Real-time WebSocket messages | Optional if time remains; otherwise polling with TanStack Query |

**### Deadline**

| Milestone | Date |

|---|---|

| Notifications backend | End of Week 2 |

| Notifications frontend | Middle of Week 3 |

| Basic DMs backend/frontend | End of Week 3 |

| Polish/testing | Week 4 |

**## Person 3: Hashtags, Explore, Search**

**### Scope**

Own discovery features.

**### Hashtags**

| Task | Description |

|---|---|

| Detect hashtags on post creation | Parse `#example` from post content |

| Store normalized hashtags | Lowercase canonical value |

| Link posts to hashtags | Insert into `postHashtag` |

| Render clickable hashtags | Convert hashtags in post content to links |

| Hashtag page | `/hashtag/\:tag` shows related posts |

**### Backend Endpoints**

| Endpoint | Purpose |

|---|---|

| `GET /api/hashtags/\:tag/posts` | Posts for hashtag |

| `GET /api/hashtags/trending` | Popular hashtags |

| `GET /api/explore` | Popular tags and posts |

| `GET /api/search?q=` | Global search |

**### Explore**

| Feature | Description |

|---|---|

| Popular hashtags | Based on post count and recent activity |

| Popular posts | Based on likes, comments, reposts, bookmarks |

| Replace static sidebar tags | Use API data instead of hardcoded `ExploreSidebar` values |

**### Search**

| Search Type | Matching |

|---|---|

| Users | `name`, `username`, `displayUsername`, `bio` |

| Hashtags | hashtag name |

| Posts | post content |

| Scope | Same university only after multi-tenancy is added |

**### Frontend Routes**

| Route | Purpose |

|---|---|

| `/explore` | Explore page |

| `/search` | Search results |

| `/hashtag/\:tag` | Hashtag feed |

**### Deadline**

| Milestone | Date |

|---|---|

| Hashtag parsing/schema/API | End of Week 2 |

| Hashtag UI/search/explore | End of Week 3 |

| Polish/testing | Week 4 |

**## Person 4: Recommendation And Multi-Tenancy**

**### Scope**

Own feed quality and tenant isolation.

**### Multi-Tenancy**

This should be implemented early because it affects almost every feature.

**### Data Model**

| Change | Description |

|---|---|

| `university` table | `id`, `name`, `slug`, email domain if needed |

| `user.universityId` | User belongs to one university |

| `post.universityId` | Post belongs to author's university |

| Optional `allowedEmailDomain` | Restrict signup by institute email |

**### Tenant Isolation Rules**

| Area | Rule |

|---|---|

| Feeds | Only posts from same university |

| Profiles | Only visible if same university, unless public cross-tenant is explicitly allowed |

| Search | Only same university |

| Hashtags | Only count/show posts from same university |

| Explore | Only same university |

| DMs | Only same university |

| Notifications | Only same university interactions |

| Likes/reposts/comments/bookmarks | Only allowed on same-university posts |

**### Backend Work**

| Task | Description |

|---|---|

| Add tenant checks | Centralize validation helper |

| Update feed queries | Filter by `post.universityId` |

| Update post creation | Copy `user.universityId` into post |

| Update interactions | Prevent cross-tenant likes/comments/reposts/bookmarks |

| Update user signup/profile | Require university selection or derive from email domain |

**### Recommendation MVP**

Start simple and explainable.

**### Signals**

| Signal | Weight |

|---|---|

| Same university | Required |

| Recently created | High |

| Posts from followed users | High |

| Hashtags user interacts with | Medium |

| Posts liked/bookmarked/reposted by user | Medium |

| Popular posts in university | Medium |

| Author already seen too often | Lower priority |

**### Implementation Approach**

| Phase | Description |

|---|---|

| MVP | SQL-based ranking inside `/api/feed/for-you` |

| Activity tracking | Store `userActivity` for likes, bookmarks, comments, follows, hashtag clicks |

| Ranking | Combine recency, popularity, followed authors, matching hashtags |

| Later | Move to background jobs or materialized recommendations if app grows |

**### Deadline**

| Milestone | Date |

|---|---|

| Multi-tenancy schema and API filtering | End of Week 2 |

| Recommendation MVP | End of Week 3 |

| Tenant isolation audit | Week 4 |

**## Suggested Final Feature Deadlines**

| Feature | Owner | Deadline |

|---|---|---|

| Multi-tenancy foundation | Person 4 | Day 10 |

| Settings page | Person 1 | Day 17 |

| Risk-Adaptive Authentication | Person 1 | Day 24 |

| Notifications | Person 2 | Day 18 |

| Hashtags | Person 3 | Day 18 |

| Explore | Person 3 | Day 22 |

| Search | Person 3 | Day 23 |

| DMs MVP | Person 2 | Day 24 |

| Recommendation feed | Person 4 | Day 24 |

| Full integration testing | All | Day 28 |

| Final bug fixes/demo prep | All | Day 30 |

**## Priority Order**

| Priority | Feature |

|---|---|

| 1 | Multi-tenancy |

| 2 | Settings/security |

| 3 | Risk-Adaptive Authentication |

| 4 | Hashtags |

| 5 | Search |

| 6 | Notifications |

| 7 | Explore |

| 8 | Recommendation feed |

| 9 | DMs |

| 10 | Group chats/voice/video |

DMs are valuable, but multi-tenancy, search, hashtags, notifications, and authentication/security affect the core app more directly and should be finished first.

**## Risks**

| Risk | Mitigation |

|---|---|

| Multi-tenancy added late causes bugs | Implement in Week 1/2 before other features fully integrate |

| DMs become too large | Keep MVP text-only and polling-based |

| Recommendations become complex | Start with SQL ranking, not ML |

| Notification spam | Do not notify users for their own actions |

| Search performance | Start with `ILIKE`; add indexes/full-text search later if needed |

| Hashtag parsing edge cases | Use one shared parser function on backend |

| RAA adds authentication friction | Use adaptive verification so only higher-risk logins require additional steps |

| RAA model performs poorly | Keep the rule-based assessment as the active decision mechanism and use ML in shadow mode for comparison |

**## Final Deliverable By End Of Month**

The application should have:

| Area | Expected Result |

|---|---|

| Settings | Account, password, sessions, delete account |

| Authentication security | Risk-adaptive authentication with LOW, MEDIUM, and HIGH risk responses, including a user-configured security question for HIGH risk |

| Notifications | Inbox for likes, comments, follows, reposts, quotes |

| DMs | Basic one-to-one messaging |

| Hashtags | Parsed, stored, clickable, hashtag feed |

| Explore | Popular hashtags and popular posts |

| Search | Users, posts, hashtags |

| Recommendations | Improved "For You" feed based on activity |

| Multi-tenancy | University-isolated users, posts, feeds, search, DMs, and interactions |