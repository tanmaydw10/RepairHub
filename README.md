# RepairHub 🛠️

> **Smart On-Demand Repair Services Platform**  
> A full-stack web application connecting customers who need electronics and appliance repairs with verified technicians who can diagnose, schedule, manage, and complete repair requests.

---

## 🚀 Key Features

### 👤 Customer Side
1. **Modern Startup Landing Page**:
   - Visual identity with dynamic hero section, brand logo, and quick tracking search.
   - Popular repair categories (Mobile, Laptop, Computer, TV, AC, Refrigerator, Washing Machine, Other).
   - "How It Works" 3-step guide and platform benefits.
   - Live verified customer reviews.
2. **Interactive Repair Request Booking**:
   - Device category selection, problem description, optional image upload, phone number, address, urgency level, and preferred date/time slot.
   - Generates instant unique ticket IDs (e.g. `RH-2026-XXXX`).
3. **AI Diagnostic Assistant**:
   - Natural language symptom analysis.
   - Provides possible root cause, estimated cost range, recommended immediate steps, and professional inspection advisory.
   - 1-Click transfer: pre-fills the diagnosis directly into the repair booking form.
4. **Public Repair Tracking Engine**:
   - Instant ticket lookup by Request ID.
   - Displays real-time status badge (`Pending`, `Accepted`, `In Progress`, `Completed`, `Cancelled`).
   - Assigned technician name, upfront estimated cost, technician notes, and chronological timeline.
5. **Customer Profile & Repair History**:
   - Filter between all, active, and completed requests.
6. **Rating & Reviews**:
   - Post 1–5 star ratings and reviews directly upon job completion.

### 🔧 Technician & Admin Side
1. **Technician Portal & Authentication**:
   - Secure login & registration with password hashing (`bcryptjs`) and JWT authentication.
   - 1-Click demo accounts for rapid testing.
2. **Technician Dashboard & Statistics**:
   - Modern metric cards: Total Requests, Pending, In Progress, Completed, Today's Requests, Estimated Revenue, and Average Rating.
3. **Request Management & Dispatch**:
   - Search by ticket ID, problem keyword, phone, or address.
   - Filter by status and repair category.
   - One-click Accept or Decline.
   - Comprehensive Ticket Management Modal: update status, assign technician, set estimated cost, write diagnostic notes, and record timeline updates.
4. **Technician Profile**:
   - Edit name, phone, service categories, coverage area, and bio.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Vite 5
  - Lucide React (modern icon suite)
  - Custom Responsive Design System (Vanilla CSS with CSS variables)
- **Backend**:
  - Node.js (v20+)
  - Express.js
  - RESTful API Architecture
  - Multer (file & image uploads)
  - Morgan (request logging)
  - CORS & Dotenv
- **Authentication**:
  - JSON Web Tokens (JWT)
  - Bcrypt password hashing
  - Role-based authorization (`customer`, `repairer`, `admin`)
- **Database**:
  - PostgreSQL (connection pool via `pg` driver)
  - Environment variable configuration
  - Auto-initializing schema (`users`, `repairers`, `repair_requests`, `repair_updates`, `reviews`)
  - Intelligent local store fallback for offline/instant evaluation without mandatory PostgreSQL installation

---

## 📁 Project Structure

```
RepairHub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # PostgreSQL pool & fallback store
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, login, me
│   │   │   ├── requestController.js  # CRUD, tracking, assign, status
│   │   │   ├── reviewController.js   # Customer ratings & reviews
│   │   │   ├── aiController.js       # AI diagnosis endpoint
│   │   │   └── repairerController.js # Dashboard statistics & profile
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT & role verification
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── models/
│   │   │   ├── schema.sql            # PostgreSQL DDL tables
│   │   │   └── dbRepository.js       # Unified data access layer
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── requestRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── repairerRoutes.js
│   │   ├── services/
│   │   │   └── aiService.js          # AI heuristic & Gemini engine
│   │   └── server.js                 # Express server entry point
│   ├── uploads/                      # Uploaded repair photos
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Sticky responsive navigation
│   │   │   ├── Footer.jsx            # Product footer
│   │   │   └── StatusBadge.jsx       # Status badges with icons
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Session state & demo auth
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Startup landing page
│   │   │   ├── RequestRepairPage.jsx # Multi-step booking form
│   │   │   ├── TrackRepairPage.jsx   # Live tracking & reviews
│   │   │   ├── AiAssistantPage.jsx   # AI diagnostic assistant
│   │   │   ├── CustomerProfilePage.jsx# Customer tickets overview
│   │   │   ├── RepairerLoginPage.jsx # Technician login & demo
│   │   │   ├── RepairerDashboardPage.jsx # Technician stats & modal
│   │   │   └── RepairerProfilePage.jsx# Technician profile editor
│   │   ├── services/
│   │   │   └── api.js                # Frontend API client
│   │   ├── App.jsx                   # Main routing & state
│   │   ├── main.jsx                  # React DOM root
│   │   └── index.css                 # Startup design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)
- (Optional) PostgreSQL installed and running locally

---

### 1. Backend Setup & Run

Open a terminal in the root directory:
```bash
cd backend
npm install
```

Configure environment variables:
Create a `.env` file in the `backend/` directory (or use `.env.example` as a template):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/repairhub_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=repairhub_db
PGUSER=postgres
PGPASSWORD=postgres

# JWT Secret
JWT_SECRET=repairhub_dev_secret_key_change_in_production_32char

# AI Assistant (Optional: add your Gemini API key, or use built-in expert engine)
GEMINI_API_KEY=
```

Start the backend server:
```bash
npm start
```
The server will run on **`http://localhost:5000`**.  
Health check: `http://localhost:5000/api/health`

---

### 2. Frontend Setup & Run

Open a second terminal in the root directory:
```bash
cd frontend
npm install
npm run dev
```

The frontend application will be live at:  
👉 **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

For quick presentation and evaluation, pre-seeded accounts are provided:

| Role | Email | Password | Quick Action |
|---|---|---|---|
| **Lead Technician** | `repairer@repairhub.local` | `password123` | Use 1-Click login in Repairer Portal |
| **Customer** | `customer@repairhub.local` | `password123` | Use 1-Click login in Repairer Portal |

---

## 🔍 Pre-seeded Demo Ticket IDs for Tracking
- `RH-2024-001` (In Progress — Laptop Repair)
- `RH-2024-002` (Pending — Mobile Repair)
- `RH-2024-003` (Completed — AC Repair with 5-star review)

---

## 🛡️ API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create customer or repairer account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get current session profile

### Repair Requests (`/api/requests`)
- `POST /api/requests` - Submit repair request (supports optional image upload)
- `GET /api/requests` - List requests with query filters (`status`, `repair_type`, `search`)
- `GET /api/requests/track/:id` - Public lookup by Request ID
- `GET /api/requests/:id` - Detailed ticket view with timeline
- `PATCH /api/requests/:id` - Update ticket details (Protected: Repairer)
- `PATCH /api/requests/:id/status` - Transition ticket status (Protected: Repairer)
- `POST /api/requests/:id/assign` - Assign technician (Protected: Repairer)

### AI Assistant (`/api/ai`)
- `POST /api/ai/diagnose` - Natural language symptom analysis

### Reviews (`/api/reviews`)
- `GET /api/reviews` - Fetch verified reviews
- `POST /api/reviews` - Submit rating & review for completed repair

### Repairer Hub (`/api/repairer`)
- `GET /api/repairer/dashboard/stats` - Admin & technician KPI metrics
- `GET /api/repairer/profile` - Get technician profile
- `PUT /api/repairer/profile` - Update technician profile

---

## 🌐 Production Deployment Guide

### Deployment Overview
- **Source Code**: GitHub
- **Backend API**: Render (Web Service)
- **Database**: PostgreSQL (Render PostgreSQL, Neon, or Supabase)
- **Frontend UI**: Vercel

---

### Step 1: Push Source Code to GitHub

1. Initialize Git in the project root:
   ```bash
   git init
   ```
2. Verify that `.gitignore` excludes `.env`, `node_modules/`, and `dist/`:
   ```bash
   git status
   ```
   *(Ensure no `.env` files appear in the untracked files list).*
3. Commit and push to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: prepare RepairHub full-stack app for production deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/repairhub.git
   git push -u origin main
   ```

---

### Step 2: Deploy PostgreSQL Database on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL**.
3. Fill in the details:
   - **Name**: `repairhub-db`
   - **Database**: `repairhub_db`
   - **User**: `repairhub_user`
   - **Region**: Choose the region closest to you (e.g., Oregon or Frankfurt).
   - **Plan**: Free
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (if deploying backend on Render) or **External Database URL**.

---

### Step 3: Deploy Backend Web Service on Render

1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository (`repairhub`).
3. Configure the service settings:
   - **Name**: `repairhub-backend` (or your choice)
   - **Region**: Same region as your PostgreSQL instance
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Expand **Advanced** -> **Add Environment Variable**:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Injected automatically by Render |
   | `DATABASE_URL` | `postgresql://...` | Connection string from Step 2 |
   | `CLIENT_URL` | `https://your-app.vercel.app` | Vercel frontend URL (can update after Step 4) |
   | `JWT_SECRET` | *(generate a random 32+ char string)* | Secret for auth tokens |
   | `GEMINI_API_KEY` | *(optional)* | Google Gemini key for AI assistant |
5. Click **Create Web Service**.
6. When deployment finishes, copy your Render service URL:  
   👉 `https://repairhub-backend.onrender.com`
7. Test the health endpoint: `https://repairhub-backend.onrender.com/api/health`.

> **Note on Database Setup**: On first start, the backend automatically runs `initDb()` which runs `schema.sql` and seeds initial demo data into PostgreSQL if empty!

---

### Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`repairhub`).
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)
5. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://repairhub-backend.onrender.com` |
   *(Paste your actual Render backend URL without a trailing slash)*
6. Click **Deploy**.
7. Vercel will build and deploy the React application. You will receive a URL like:  
   👉 `https://repairhub-app.vercel.app`

---

### Step 5: Connect Frontend URL to Backend CORS

1. Go back to your Render Dashboard -> `repairhub-backend` -> **Environment**.
2. Update `CLIENT_URL` to your live Vercel URL (e.g. `https://repairhub-app.vercel.app`).
3. Save changes — Render will automatically re-deploy with updated CORS headers.
4. Enjoy your live production application!

