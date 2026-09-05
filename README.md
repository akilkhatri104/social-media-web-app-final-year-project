# Social Media Web Application for College Students

A social media web application for college students and faculties to connect and socialize.

**## Features**

\- **\*\*Authentication\*\*** – Sign up / sign in with username & email, email OTP verification, forgot/reset password, secure session cookies via [Better Auth]\([https://better-auth.com](https://better-auth.com)), and risk-adaptive authentication based on login context.

\- **\*\*Risk-Adaptive Authentication\*\*** – Evaluates authentication risk using consecutive failed attempts, new IP address, new device, and unusual login time. LOW-risk logins continue normally, MEDIUM-risk logins require email OTP verification, and HIGH-risk logins require an additional security challenge. A Logistic Regression model is also evaluated in shadow mode for comparison.

\- **\*\*Feed\*\*** – Home timeline of posts from people you follow

\- **\*\*Posts\*\*** – Create text posts with image/video upload, edit, and delete

\- **\*\*Engagement\*\*** – Like, comment, repost, quote-post, and bookmark posts

\- **\*\*Follow system\*\*** – Follow/unfollow users and see follower/following counts

\- **\*\*Profiles\*\*** – Public user profiles (\`/@username\`) with bio and avatar

\- **\*\*Explore & Discovery\*\*** – Explore tab with trending posts, hashtag pages, and discoverable content

\- **\*\*Search\*\*** – Search for users, posts, and hashtags

\- **\*\*Hashtags\*\*** – Auto-linking and dedicated hashtag feeds

\- **\*\*Notifications\*\*** – In-app notifications with per-type preferences plus optional email notifications

\- **\*\*Messaging\*\*** – Direct messages between users

\- **\*\*Settings\*\*** – Account, security, and notification preferences

\- **\*\*Dark mode\*\*** – Light/dark theme toggle

\- **\*\*Responsive UI\*\*** – Built with Tailwind CSS and shadcn/ui components

**## Tech Stack**

**### Client (\`client/\`)**

\- **\*\*React 19\*\*** with **\*\*React Router 7\*\*** (framework mode, SSR + HMR)

\- **\*\*TypeScript\*\***

\- **\*\*Vite 7\*\*** build tooling

\- **\*\*Tailwind CSS 4\*\*** + **\*\*shadcn/ui\*\*** (Radix UI / Base UI)

\- **\*\*TanStack React Query\*\*** for server state

\- **\*\*Axios\*\*** for API calls

\- **\*\*react-hook-form\*\*** + **\*\*zod\*\*** for forms and validation

\- **\*\*sonner\*\*** for toasts, **\*\*next-themes\*\*** for theming, **\*\*lucide-react\*\*** for icons

\- **\*\*Vitest\*\*** + **\*\*Testing Library\*\*** for tests

**### Server (\`server/\`)**

\- **\*\*Node.js\*\*** with **\*\*Express 5\*\***

\- **\*\*TypeScript\*\*** (run with \`tsx\`, compiled with \`tsc\`)

\- **\*\*Better Auth\*\*** for authentication (username + email OTP plugins, Drizzle adapter)

\- **\*\*Drizzle ORM\*\*** + **\*\*drizzle-kit\*\*** for schema and migrations

\- **\*\*Neon\*\*** (Postgres, serverless driver)

\- **\*\*Cloudinary\*\*** for media storage and thumbnail generation

\- **\*\*Multer\*\*** for file uploads

\- **\*\*Nodemailer\*\*** for transactional/notification emails

\- **\*\*express-rate-limit\*\*** for API rate limiting

\- **\*\*Jest\*\*** + **\*\*Supertest\*\*** for tests

**### Risk-Adaptive Authentication / ML**

\- **\*\*Python\*\*** for authentication risk model training and evaluation

\- **\*\*scikit-learn\*\*** for Logistic Regression and Decision Tree evaluation

\- **\*\*JSON model artifact\*\*** for loading the trained Logistic Regression model into the server

**## Documentation**

\- **\*\*Architecture & feature implementation details\*\*** – see [TECHNICAL.md]\(./TECHNICAL.md)

\- **\*\*Project roadmap\*\*** – see [ROADMAP.md]\(./ROADMAP.md)

**## Run Locally**

**### Prerequisites**

\- Node.js 20+

\- npm

\- Python 3+

\- A Postgres database (e.g. [Neon]\([https://neon.tech](https://neon.tech)))

\- A [Cloudinary]\([https://cloudinary.com](https://cloudinary.com)) account

\- An SMTP provider (e.g. Brevo, Mailtrap)

**### 1. Clone and install**

\`\`\`bash

git clone [https://github.com/akilkhatri104/social-media-web-app-final-year-project](https://github.com/akilkhatri104/social-media-web-app-final-year-project)

cd social-media-web-app-final-year-project

\`\`\`

**### 2. Server**

\`\`\`bash

cd server

npm install

\`\`\`

Copy \`.env.sample\` to \`.env\` and fill in the required values (see [Environment Variables]\(#environment-variables)):

\`\`\`bash

cp .env.sample .env

\`\`\`

Create the database tables based on \`server/src/lib/db/schema.ts\` and \`server/src/lib/auth-schema.ts\`:

\`\`\`bash

npm run db\:push

\`\`\`

The database schema includes the \`auth\_risk\_event\` table used to record authentication risk signals, risk scores, risk levels, and authentication outcomes.

Start the development server:

\`\`\`bash

npm run dev

\`\`\`

The server will run at \`[http://localhost:8000](http://localhost:8000)\`.

**### 3. Client**

In a new terminal:

\`\`\`bash

cd client

npm install

\`\`\`

Copy \`.env.sample\` to \`.env\` and set the values:

\`\`\`bash

cp .env.sample .env

\`\`\`

Start the development server:

\`\`\`bash

npm run dev

\`\`\`

The app will be available at \`[http://localhost:5173](http://localhost:5173)\`.

**## Building for Production**

**### Client**

\`\`\`bash

cd client

npm run build

\`\`\`

**### Server**

\`\`\`bash

cd server

npm run build

npm run start

\`\`\`

**## Testing**

**### Client**

\`\`\`bash

cd client

npm run test

\`\`\`

**### Server**

\`\`\`bash

cd server

npm run test

\`\`\`

**### Risk-Adaptive Authentication**

The RAA prototype was tested across LOW, MEDIUM, and HIGH authentication flows. The ML evaluation uses a synthetic dataset of 150 authentication events and compares Logistic Regression, Decision Tree, and the rule-based risk assessment.

| Approach | Accuracy |
| --- | ---: |
| Logistic Regression | 0.684 |
| Decision Tree | 0.605 |
| Rule-Based | 0.607 |

The Logistic Regression model currently operates in shadow mode and does not control the authentication decision. The dataset is synthetic and is intended for prototype evaluation rather than production security validation.

**## Linting**

\`\`\`bash

cd server

npm run lint

\`\`\`

**## Database Migrations**

Generate a migration after schema changes:

\`\`\`bash

npm run db\:generate

\`\`\`

Apply migrations:

\`\`\`bash

npm run db\:migrate

\`\`\`

Regenerate the Better Auth schema after auth changes:

\`\`\`bash

npm run db\:generate-auth

\`\`\`

**## Environment Variables**

To run this project, you will need to add the following environment variables to your \`.env\` files.

**### \`client/.env\`**

\`VITE\_BACKEND\_URL\` : URL of the backend

\`VITE\_FRONTEND\_URL\` : URL of the frontend

For Vercel deployments, leave \`VITE\_BACKEND\_URL\` unset so the client uses same-origin \`/api/\*\` requests and Vercel rewrites them to the backend.

**### \`server/.env\`**

\`PORT\` : Port at which the server will run on localhost (default \`8000\`)

\`FRONTEND\_URL\` : Base URL of your frontend

Set this to the exact production Vercel URL used by users, with no trailing slash.

\`BACKEND\_URL\` : Base URL of your backend

Set this to the exact DigitalOcean API origin, with no trailing slash.

\`DATABASE\_URL\` : Connection string for the Postgres database

\`BETTER\_AUTH\_SECRET\` : A secret value used for encryption and hashing. It must be at least 32 characters and generated with high entropy. Generate one with \`openssl rand -base64 32\`.

\`CLOUDINARY\_CLOUD\_NAME\` : Cloud name from your Cloudinary environment

\`CLOUDINARY\_API\_KEY\` : API key for your Cloudinary environment

\`CLOUDINARY\_API\_SECRET\` : API Secret for your Cloudinary API key

\`SMTP\_HOST\` : Host URL of your SMTP service (e.g. Brevo, Mailtrap)

\`SMTP\_PORT\` : SMTP port of the service (e.g. 587)

\`SMTP\_USERNAME\` : Username of the SMTP service

\`SMTP\_PASSWORD\` : Password for the SMTP service

\`SMTP\_FROM\_NAME\` : Name of the sender

\`SMTP\_FROM\_EMAIL\` : Email of the SMTP sender

\`HIGH\_RISK\_SECURITY\_ANSWER\` : Answer used for the additional security challenge for high-risk authentication.
