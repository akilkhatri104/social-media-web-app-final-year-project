# Social Media Web Application for College Students

A social media web application for college students and faculties to connect and socialize.

## Run Locally

Clone the project

```bash
  git clone https://github.com/akilkhatri104/social-media-web-app-final-year-project
```

Go to the project directory

```bash
  cd social-media-web-app-final-year-project

```

### Client

Go to the client directory

```bash
  cd client

```

Install the dependencies:

```bash
npm install
```

Copy `.env-sample` and paste into `.env`, set all the values requiered

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

### Server

Go to the server directory

```bash
  cd server

```

Install dependencies

```bash
  npm install
```

Copy `.env-sample` and paste into `.env`, set all the values requiered

Create tables in the database based on `server\src\lib\db\schema.ts` and `server\src\lib\auth-schema.ts`

```bash
  npm run db:push
```

Start the server

```bash
    npm run dev
```

OR

```bash
    npm run start
```

OR

Build for production

```bash
    npm run build
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### `client/.env

`VITE_BACKEND_URL` : URL of the backend

`VITE_FRONTEND_URL` : URL of the frontend

For Vercel deployments using `client/vercel.json`, leave `VITE_BACKEND_URL` unset so the client uses same-origin `/api/*` requests and Vercel rewrites them to the backend.

### `server/.env`

`PORT` : Port at which the server will run on localhost

`FRONTEND_URL` : Base URL of your frontend

Set this to the exact production Vercel URL used by users, with no trailing slash.

`BACKEND_URL` : Base URL of your backend

Set this to the exact DigitalOcean API origin, with no trailing slash.

`DATABASE_URL` : Connection string for the Postgres database

`BETTER_AUTH_SECRET` : A secret value used for encryption and hashing. It must be at least 32 characters and generated with high entropy.

`CLOUDINARY_CLOUD_NAME` : Cloud name from your Cloudinary envrionment

`CLOUDINARY_API_KEY` : API key for your Cloudinary envrionment

`CLOUDINARY_API_SECRET` : API Secret for your Cloudinary api key

`SMTP_HOST` : Host URL of your SMTP service (ie. Brevo,MailTrap)

`SMTP_PORT` : SMTP port of the service (ie. 587)

`SMTP_USERNAME` : Username of the SMTP service

`SMTP_PASSWORD` : Password for the SMTP service

`SMTP_FROM_EMAIL` : Email of the SMTP sender

`SMTP_FROM_NAME` : Name of the sender
