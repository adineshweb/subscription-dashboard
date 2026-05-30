# Subscription Management Dashboard

A production-ready SaaS Admin & Subscription Management Dashboard built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS. The app features secure JWT authentication (with refresh token rotation in cookies), role-based guards, dynamic database fallbacks, and a complete Razorpay test payment integration (with mock fallbacks).

---

## Tech Stack

### Frontend
- **Framework**: React (scaffolded via Vite)
- **State Management**: Redux Toolkit & React Redux
- **Routing**: React Router DOM (v6)
- **Form Management**: React Hook Form
- **Styling**: Tailwind CSS & Lucide Icons
- **HTTP Client**: Axios (with custom silent-refresh interceptors)

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Validation**: Zod Schemas

---

## Key Features

1. **Authentication & Authorization**: Role-based access control (`user` and `admin`).
2. **Short/Long JWT Session Flow**: 15-minute access token rotation matched with 7-day refresh token rotation (secure HTTP-only cookie).
3. **Seeded Plan Packages**: Automatically populates `Basic`, `Pro`, `Premium`, and `Enterprise` packages.
4. **Razorpay Payments**: Integrated Razorpay checkout modal; falls back to simulated direct activation if API credentials are not provided.
5. **Admin panel**: Pagination, user querying (name/email search), status and plan dropdown filters, and gross spend MRR metrics.
6. **Dark/Light Mode**: Synced with local storage and root document classes.
7. **Profile Management**: Profile name/email updates and secure password matching changes.

---

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally (port `27017`) or a MongoDB Atlas account

### 1. Database Seeding
Navigate to the server directory and seed the default pricing plans:
```bash
cd server
npm install
npm run seed
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_LOCAL_URI=mongodb://127.0.0.1:27017/subscription_dashboard
JWT_ACCESS_SECRET=super_secret_short_lived_access_token_key_12345
JWT_REFRESH_SECRET=super_secret_long_lived_refresh_token_key_67890
CLIENT_URL=http://localhost:5173

# Razorpay credentials (falls back to simulation if blank)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Applications Locally

#### Start the Express Server
```bash
cd server
npm run dev
```

#### Start the Vite React App
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /register`: Registers a new user. Default role is `user` (the first registered user on a clean DB becomes `admin` automatically for local test ease).
- `POST /login`: Validates password, sets refresh cookie, returns access JWT.
- `POST /refresh-token`: Requests a new access token using the stored refresh token.
- `POST /logout`: Blacklists and clears the refresh session token.

### Pricing Plans (`/api/plans`)
- `GET /`: Lists all seeded subscription packages.

### Subscriptions (`/api/subscribe`)
- `POST /order/:planId`: Creates a payment order (Razorpay or simulated ID).
- `POST /:planId`: Validates checkout signatures, sets active plan status, and expires previous user subscriptions.
- `GET /my-subscription`: Fetches details of the user's active plan (runs a dynamic expiry check first).

### Administrative (`/api/admin/subscriptions`)
- `GET /`: (Admin only) Lists all client subscriptions with search (`?search=john`), status filters (`?status=active`), and pagination metadata.

### Profile (`/api/user/profile`)
- `GET /`: Retrieves account profile data.
- `PUT /`: Updates username, email, or credentials.

---

## Deployment Guide

### Backend: Render
1. Push your code to a public GitHub repository.
2. In Render, create a new Web Service and link your repository.
3. Configure the root directory to `server` or use standard monorepo paths.
4. Set Environment Variables under Settings. Use `node server.js` as the start command.

### Frontend: Vercel
1. Link your repository in Vercel.
2. Choose `client` as the root directory.
3. Set the Framework Preset to `Vite`.
4. Add the `VITE_API_URL` environment variable pointing to your deployed Render URL (e.g. `https://your-service.onrender.com/api`).
5. Deploy.
