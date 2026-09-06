# Social Media Web Application for College Students

A social media web application for college students and faculty to connect, communicate, and socialize.

## Features

### Authentication
- Sign up and sign in using username and email
- Email OTP verification
- Forgot/reset password
- Secure session management using Better Auth
- Risk-Adaptive Authentication based on login context

### Risk-Adaptive Authentication
The application evaluates authentication risk using contextual login signals:

- Consecutive failed login attempts
- New IP address
- New device
- Unusual login time

Authentication is dynamically adapted based on the calculated risk level:

| Risk Level | Authentication Requirement |
| --- | --- |
| **LOW** | Normal login |
| **MEDIUM** | Email OTP verification |
| **HIGH** | Additional security verification |

For HIGH-risk authentication, users can configure a personal security question and answer from their security settings.

Security questions have the following protections:

- Answers are securely hashed using `scrypt`
- Answers are never stored in plaintext
- Changing a security question requires the user's current password
- Users without a configured security question fall back to email OTP verification

A Logistic Regression model is evaluated in shadow mode alongside the rule-based system and does not currently control authentication decisions.

### Social Features
- **Feed** – Home timeline of posts from people you follow
- **Posts** – Create text posts with image/video uploads, edit, and delete
- **Engagement** – Like, comment, repost, quote-post, and bookmark posts
- **Follow System** – Follow/unfollow users and view follower/following counts
- **Profiles** – Public user profiles with bio and avatar
- **Explore & Discovery** – Trending posts, hashtag pages, and discoverable content
- **Search** – Search users, posts, and hashtags
- **Hashtags** – Automatic hashtag linking and dedicated hashtag feeds
- **Notifications** – In-app notifications with per-type preferences and optional email notifications
- **Messaging** – Direct messaging between users

### User Experience
- **Settings** – Account, security, notification preferences, and security question management
- **Dark Mode** – Light/dark theme toggle
- **Responsive UI** – Tailwind CSS and shadcn/ui components

## Tech Stack

### Client

Located in `client/`.

- **React 19**
- **React Router 7**
- **TypeScript**
- **Vite 7**
- **Tailwind CSS 4**
- **shadcn/ui**
- **TanStack React Query**
- **Axios**
- **react-hook-form** + **zod**
- **sonner**
- **next-themes**
- **lucide-react**
- **Vitest** + **Testing Library**

### Server

Located in `server/`.

- **Node.js**
- **Express 5**
- **TypeScript**
- **Better Auth**
- **Drizzle ORM**
- **drizzle-kit**
- **Neon Serverless PostgreSQL**
- **Cloudinary**
- **Multer**
- **Nodemailer**
- **express-rate-limit**
- **Jest** + **Supertest**

### Risk-Adaptive Authentication / ML

- **Python**
- **scikit-learn**
- **Logistic Regression**
- **Decision Tree**
- **JSON model artifact**
- **Synthetic authentication dataset**

## Authentication Risk Assessment

The RAA prototype combines authentication context signals to calculate a risk level.

### Rule-Based Assessment

The current authentication decision is controlled by the rule-based risk assessment.

Signals include:

- Failed login attempts
- IP address changes
- Device changes
- Login time anomalies

The resulting risk level determines the authentication step required.

### ML Evaluation

A synthetic dataset containing **150 authentication events** was used to compare the rule-based approach with two machine-learning models.

| Approach | Accuracy |
| --- | ---: |
| Logistic Regression | 0.684 |
| Decision Tree | 0.605 |
| Rule-Based | 0.607 |

The Logistic Regression model currently operates in **shadow mode**. It is evaluated against the rule-based approach but does not control authentication decisions.

The dataset is synthetic and is intended for prototype and research evaluation rather than production security validation.

## Database

The application uses PostgreSQL through Neon and Drizzle ORM.

### `auth_risk_event`

Stores authentication risk events including:

- Authentication risk signals
- Risk scores
- Risk levels
- Authentication outcomes

### `security_question`

Stores user-configured security questions and securely hashed answers.

The answer is stored using:

- `scrypt` password hashing
- Random per-user salt
- Timing-safe hash comparison during verification

## Documentation

- **Architecture and implementation details** – [TECHNICAL.md](./TECHNICAL.md)
- **Project roadmap** – [ROADMAP.md](./ROADMAP.md)
- **Development tasks** – [TODO.md](./TODO.md)

## Run Locally

### Prerequisites

- Node.js 20+
- npm
- Python 3+
- PostgreSQL database, such as Neon
- Cloudinary account
- SMTP provider such as Brevo or Mailtrap

### 1. Clone the repository

```bash
git clone https://github.com/akilkhatri104/social-media-web-app-final-year-project
cd social-media-web-app-final-year-project
```

### 2. Set up the server

```bash
cd server
npm install
```

Copy the environment template:

```bash
cp .env.sample .env
```

Configure the required environment variables.

Create/update the database schema:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The server runs at:

```text
http://localhost:8000
```

### 3. Set up the client

Open a new terminal:

```bash
cd client
npm install
```

Copy the environment template:

```bash
cp .env.sample .env
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

The application runs at:

```text
http://localhost:5173
```

## Building for Production

### Client

```bash
cd client
npm run build
```

### Server

```bash
cd server
npm run build
npm run start
```

## Testing

### Client

```bash
cd client
npm run test
```

### Server

```bash
cd server
npm run test
```

### Risk-Adaptive Authentication

The RAA implementation has been tested across:

- LOW-risk authentication
- MEDIUM-risk authentication with email OTP
- HIGH-risk authentication with security challenge
- Incorrect security answers
- Users without configured security questions
- Security question creation
- Security question persistence after reload
- Security question changes requiring the current password

## Linting

```bash
cd server
npm run lint
```

## Database Migrations

Generate a migration after making schema changes:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Regenerate the Better Auth schema after authentication schema changes:

```bash
npm run db:generate-auth
```

## Environment Variables

The application requires environment variables for the client and server.

### `client/.env`

`VITE_BACKEND_URL` – URL of the backend.

`VITE_FRONTEND_URL` – URL of the frontend.

For Vercel deployments, leave `VITE_BACKEND_URL` unset so the client uses same-origin `/api/*` requests and Vercel rewrites them to the backend.

### `server/.env`

`PORT` – Port at which the server runs locally. Default: `8000`.

`FRONTEND_URL` – Base URL of the frontend.

Set this to the exact production Vercel URL used by users, without a trailing slash.

`BACKEND_URL` – Base URL of the backend.

Set this to the exact DigitalOcean API origin, without a trailing slash.

`DATABASE_URL` – PostgreSQL database connection string.

`BETTER_AUTH_SECRET` – Secret used by Better Auth for encryption and hashing. It must be at least 32 characters and generated with high entropy.

Example:

```bash
openssl rand -base64 32
```

`CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name.

`CLOUDINARY_API_KEY` – Cloudinary API key.

`CLOUDINARY_API_SECRET` – Cloudinary API secret.

`SMTP_HOST` – SMTP service host.

`SMTP_PORT` – SMTP service port, such as `587`.

`SMTP_USERNAME` – SMTP service username.

`SMTP_PASSWORD` – SMTP service password.

`SMTP_FROM_NAME` – Sender display name.

`SMTP_FROM_EMAIL` – Sender email address.
