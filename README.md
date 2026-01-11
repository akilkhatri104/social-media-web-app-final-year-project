# Social Media Web Application for College Students

A social media web application for college students and faculties to connect and socialize.

## Run Locally

### Server

Clone the project

```bash
  git clone https://github.com/akilkhatri104/social-media-web-app-final-year-project
```

Go to the project directory

```bash
  cd
social-media-web-app-final-year-project

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

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### `server/.env`

`PORT` : Port at which the server will run on localhost

`DATABASE_URL` : Connection string for the Postgres database

`BETTER_AUTH_SECRET` : A secret value used for encryption and hashing. It must be at least 32 characters and generated with high entropy.

`BETTER_AUTH_URL` : Base URL of your app
