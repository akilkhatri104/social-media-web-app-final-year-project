# TODOs: Social-Media Web App – Bugs & Issue Remediation

## HIGH PRIORITY

- [ ] Enforce consistent session checks on **every protected backend controller** (e.g., bookmarks, reposts, notifications, follows, discovery, etc.).
  - Add early `if (!req.session || !req.session.user)` guards and return 401 everywhere sensitive userId is accessed.
  - Audit all controllers for missing/fragile session checks.

- [ ] Update all backend entrypoints to reliably return **401/403 on unauthorized access**, not 200 with empty or ambiguous responses.

- [ ] Audit and lock down CORS configuration in `server/src/index.ts`:
  - Only allow specific, hard-coded frontend origins (dev and prod).
  - Make sure `credentials: true` cookies are only sent to the allowed origin.
  - Add logging or errors if the environment misconfigures the allowed origin.

- [ ] Reduce query cache times for all notification, count, and live-update queries on the frontend (e.g., `unreadCount`, `useMe`, timeline/feed, etc.):
  - Replace `staleTime: Infinity` with something sensible (e.g., 10s-60s).
  - Ensure user sees up-to-date data after interactions or tab changes.

- [-] Add or fix cleanup for **all component event listeners** on the frontend:
  - For every `addEventListener`, ensure a corresponding `removeEventListener` in the `useEffect` cleanup function.

## MEDIUM PRIORITY

- [-] Replace all backend code using `process.env.*!` (non-null assertions) with robust runtime validation at startup:
  - If any critical env var is missing, log a clear error and fail fast.

- [-] Add basic express rate-limiting (e.g., on login/signup/discovery/feed endpoints) to reduce spam, brute force, and abuse risk.

- [-] Improve error boundary handling:
  - Ensure any thrown error does NOT leak stack traces or internal details to users.
  - Prefer custom, user-friendly error messages, especially for auth/database/config issues.

## LOW PRIORITY

- [-] Add handling for SSR quirks and multi-tab session behavior on the frontend:
  - Make sure session/localStorage data syncs reliably (e.g., on logout in another tab).
  - Sanitize/fallback logic for corrupted or missing local/sessionStorage entries.

- [ ] Create explicit “error” and “pending” UI screens for each user data fetching route.
  - All places using `useQuery`, etc., should clearly differentiate empty/error/loading.

- [ ] Regularly run and act upon `npm audit --production` in both client and server.
  - Schedule for every release; address high and critical external dependencies.

- [ ] Add missing test coverage for new/core flows. (Review current test folder status!)
