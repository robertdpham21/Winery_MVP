# Winery MVP Setup Guide

This repository contains a backend API built with Express/Sequelize and a frontend built with React + Vite.

## Prerequisites

- Node.js 18 or newer
- npm
- A Neon PostgreSQL database
- Asgardeo application credentials
- Stripe test credentials

## Environment Variables

Create environment files before running the app.
- Side note: All environment variables are in the Credentials + .env files document that was submitted in canvas to follow best Github practices.

### Backend `backend/.env`

Required variables:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key for server-side payment intents
- `ASGARDEO_ORG` - Your Asgardeo organization name

Example:

```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
ASGARDEO_ORG=sabtamorg
```

### Frontend `frontend/.env`

Required variables:

- `VITE_ASGARDEO_CLIENT_ID` - Asgardeo client ID
- `VITE_ASGARDEO_BASE_URL` - Asgardeo API base URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

Example:

```env
VITE_ASGARDEO_CLIENT_ID=...
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-org
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Run the Backend

The backend entry point is `backend/server.js`.

```bash
cd backend
node server.js
```

The server listens on port `5001` by default unless `PORT` is set.

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite will start the app on the local development server shown in the terminal.

## Seed the Database in Neon

This app uses the `app` schema in PostgreSQL by default. The backend expects the database tables to already exist in Neon.

### Option 1: Seed directly in Neon SQL Editor

1. Open your Neon project.
2. Open the **SQL Editor**.
3. Make sure the `app` schema exists.
4. Run your table creation SQL if the database is empty.
5. Insert seed data for `users`, `wines`, `orders`, and `order_items`.

### Option 2: Import a SQL file

1. Put your schema and seed statements into a `.sql` file.
2. Open Neon SQL Editor or use Neon’s import workflow.
3. Run the script against the target database.

### Example seed flow

A typical order is:

1. Create the schema:
   - `CREATE SCHEMA IF NOT EXISTS app;`
2. Create the tables.
3. Insert wine rows.
4. User rows are inserted through Asgardeo and creating an account. 
5. Insert orders and order items if you want sample order history.

### Notes

- The backend reads from the `app` schema by default.
- If you change the schema name, update the backend Sequelize configuration in `backend/server.js`.
- After seeding, verify the data by querying the tables in Neon’s SQL Editor.

## Project Structure

- `backend/` - Express API, Stripe payment intent creation, and Sequelize models
- `frontend/` - React app with customer and admin pages

## Deployment on Render

This project is deployed from the connected GitHub repository using two Render services:

- Backend as a **Web Service**
- Frontend as a **Static Website**

### 1. Deploy the Backend Web Service

In Render, create a new **Web Service** from the GitHub repo and set the root directory to `backend`.

Use these settings:

- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Node Version:** 18 or newer

Set the backend environment variables in Render:

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `ASGARDEO_ORG`

Render will use `PORT` automatically, so you do not need to hardcode a port.

### 2. Deploy the Frontend Static Website

Create a new **Static Site** from the same GitHub repo and set the root directory to `frontend`.

Use these settings:

- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

Set the frontend environment variables in Render:

- `VITE_ASGARDEO_CLIENT_ID`
- `VITE_ASGARDEO_BASE_URL`
- `VITE_STRIPE_PUBLISHABLE_KEY`

After the frontend deploys, update the frontend environment values if needed so they point to the deployed backend API URL.

### 3. GitHub Auto-Deploy

Because both services are connected to GitHub, Render can redeploy automatically whenever you push changes to the repository.

### 4. Important Deployment Notes

- Make sure the backend `DATABASE_URL` points to your Neon database.
- Make sure the frontend `VITE_ASGARDEO_BASE_URL` matches your Asgardeo tenant base URL.
- If you change the backend Render URL, update the frontend API configuration so requests go to the correct backend service.

## Useful Commands

### Backend

```bash
cd backend
node server.js
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

## Troubleshooting

- If the frontend cannot sign in, verify the Asgardeo values in `frontend/.env`.
- If the backend cannot connect to Neon, verify `DATABASE_URL`.
- If Stripe checkout fails, verify both `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`.
- If authentication fails, verify `ASGARDEO_ORG` and the frontend Asgardeo base URL.
