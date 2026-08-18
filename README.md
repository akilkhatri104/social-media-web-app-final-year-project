# Social Media Web Application for College Students

A social media web application for college students and faculties to connect and socialize.

## Features

- **Authentication** – Sign up / sign in with username & email, email OTP verification, forgot/reset password, and secure session cookies via [Better Auth](https://better-auth.com)
- **Feed** – Home timeline of posts from people you follow
- **Posts** – Create text posts with image/video upload, edit, and delete
- **Engagement** – Like, comment, repost, quote-post, and bookmark posts
- **Follow system** – Follow/unfollow users and see follower/following counts
- **Profiles** – Public user profiles (`/@username`) with bio and avatar
- **Explore & Discovery** – Explore tab with trending posts, hashtag pages, and discoverable content
- **Search** – Search for users, posts, and hashtags
- **Hashtags** – Auto-linking and dedicated hashtag feeds
- **Notifications** – In-app notifications with per-type preferences plus optional email notifications
- **Messaging** – Direct messages between users
- **Settings** – Account, security, and notification preferences
- **Dark mode** – Light/dark theme toggle
- **Responsive UI** – Built with Tailwind CSS and shadcn/ui components

## Tech Stack

### Client (`client/`)

- **React 19** with **React Router 7** (framework mode, SSR + HMR)
- **TypeScript**
- **Vite 7** build tooling
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI / Base UI)
- **TanStack React Query** for server state
- **Axios** for API calls
- **react-hook-form** + **zod** for forms and validation
- **sonner** for toasts, **next-themes** for theming, **lucide-react** for icons
- **Vitest** + **Testing Library** for tests

### Server (`server/`)

- **Node.js** with **Express 5**
- **TypeScript** (run with `tsx`, compiled with `tsc`)
- **Better Auth** for authentication (username + email OTP plugins, Drizzle adapter)
- **Drizzle ORM** + **drizzle-kit** for schema and migrations
- **Neon** (Postgres, serverless driver)
- **Cloudinary** for media storage and thumbnail generation
- **Multer** for file uploads
- **Nodemailer** for transactional/notification emails
- **express-rate-limit** for API rate limiting
- **Jest** + **Supertest** for tests

## Documentation

- **Architecture & feature implementation details** – see [TECHNICAL.md](./TECHNICAL.md)

## Run Locally

### Prerequisites

- Node.js 20+
- npm
- A Postgres database (e.g. [Neon](https://neon.tech))
- A [Cloudinary](https://cloudinary.com) account
- An SMTP provider (e.g. Brevo, Mailtrap)

### 1. Clone and install

```bash
git clone https://github.com/akilkhatri104/social-media-web-app-final-year-project
cd social-media-web-app-final-year-project
```

### 2. Server

```bash
cd server
npm install
```

Copy `.env.sample` to `.env` and fill in the required values (see [Environment Variables](#environment-variables)):

```bash
cp .env.sample .env
```

Create the database tables based on `server/src/lib/db/schema.ts` and `server/src/lib/auth-schema.ts`:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:8000`.

### 3. Client

In a new terminal:

```bash
cd client
npm install
```

Copy `.env.sample` to `.env` and set the values:

```bash
cp .env.sample .env
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

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

## Linting

```bash
cd server
npm run lint
```

## Database Migrations

Generate a migration after schema changes:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Regenerate the Better Auth schema after auth changes:

```bash
npm run db:generate-auth
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files.

### `client/.env`

`VITE_BACKEND_URL` : URL of the backend

`VITE_FRONTEND_URL` : URL of the frontend

For Vercel deployments, leave `VITE_BACKEND_URL` unset so the client uses same-origin `/api/*` requests and Vercel rewrites them to the backend.

### `server/.env`

`PORT` : Port at which the server will run on localhost (default `8000`)

`FRONTEND_URL` : Base URL of your frontend

Set this to the exact production Vercel URL used by users, with no trailing slash.

`BACKEND_URL` : Base URL of your backend

Set this to the exact DigitalOcean API origin, with no trailing slash.

`DATABASE_URL` : Connection string for the Postgres database

`BETTER_AUTH_SECRET` : A secret value used for encryption and hashing. It must be at least 32 characters and generated with high entropy. Generate one with `openssl rand -base64 32`.

`CLOUDINARY_CLOUD_NAME` : Cloud name from your Cloudinary environment

`CLOUDINARY_API_KEY` : API key for your Cloudinary environment

`CLOUDINARY_API_SECRET` : API Secret for your Cloudinary API key

`SMTP_HOST` : Host URL of your SMTP service (e.g. Brevo, Mailtrap)

`SMTP_PORT` : SMTP port of the service (e.g. 587)

`SMTP_USERNAME` : Username of the SMTP service

`SMTP_PASSWORD` : Password for the SMTP service

`SMTP_FROM_NAME` : Name of the sender

`SMTP_FROM_EMAIL` : Email of the SMTP sender
