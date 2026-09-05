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

- [x] Implement **Risk-Adaptive Authentication (RAA)** prototype:
  - Assess login risk using failed attempts, new IP, new device, and unusual login time.
  - Classify authentication attempts as LOW, MEDIUM, or HIGH risk.
  - Apply adaptive authentication requirements based on risk level.
  - Log authentication risk events, risk scores, and risk levels in the database.
  - Support MEDIUM-risk email OTP verification and HIGH-risk security challenge verification.
  - Keep ML risk assessment in shadow mode for comparison with the rule-based approach.

## MEDIUM PRIORITY

- [-] Replace all backend code using `process.env.*!` (non-null assertions) with robust runtime validation at startup:
  - If any critical env var is missing, log a clear error and fail fast.

- [-] Add basic express rate-limiting (e.g., on login/signup/discovery/feed endpoints) to reduce spam, brute force, and abuse risk.

- [-] Improve error boundary handling:
  - Ensure any thrown error does NOT leak stack traces or internal details to users.
  - Prefer custom, user-friendly error messages, especially for auth/database/config issues.

- [x] Add ML-based authentication risk assessment for comparison:
  - Train Logistic Regression and Decision Tree models using the authentication risk dataset.
  - Evaluate accuracy, precision, recall, and F1 score.
  - Compare ML performance against the existing rule-based risk assessment.
  - Save the final Logistic Regression model for shadow-mode inference.

- [x] Add synthetic authentication risk dataset and evaluation artifacts:
  - Generate a 150-event dataset covering LOW, MEDIUM, and HIGH risk cases.
  - Record model comparison results for Logistic Regression, Decision Tree, and rule-based assessment.
  - Document that the dataset is synthetic and the current ML evaluation is prototype-level.

## LOW PRIORITY

- [-] Add handling for SSR quirks and multi-tab session behavior on the frontend:
  - Make sure session/localStorage data syncs reliably (e.g., on logout in another tab).
  - Sanitize/fallback logic for corrupted or missing local/sessionStorage entries.

- [-] Create explicit “error” and “pending” UI screens for each user data fetching route.
  - All places using `useQuery`, etc., should clearly differentiate empty/error/loading.

- [-] Regularly run and act upon `npm audit --production` in both client and server.
  - Schedule for every release; address high and critical external dependencies.

- [x] Add missing test coverage for new/core flows. (Review current test folder status!)
