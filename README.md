# BMS Cognitive ERP Assistant

A React-based Proof of Concept (POC) for an Enterprise Resource Planning tool featuring a simulated AI assistant.

## Features
- **AI Assistant:** Mock AI engine for inventory and order queries (No API key required).
- **Dashboard:** Real-time charts and KPIs.
- **Role-Based Access:** Admin, Sales, Customer views.

## Deployment Instructions

This project is ready to be deployed to free hosting providers like Vercel or Netlify.

### Option 1: Deploy to Vercel (Recommended)
1.  Push this code to a GitHub repository.
2.  Go to [Vercel.com](https://vercel.com) and sign up/login.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository.
5.  Vercel will detect `Vite` automatically.
6.  Click **Deploy**.

### Option 2: Deploy to Netlify
1.  Push this code to a GitHub repository.
2.  Go to [Netlify.com](https://netlify.com) and sign up/login.
3.  Click **"Add new site"** -> **"Import from existing project"**.
4.  Connect to GitHub and select your repository.
5.  **Build settings:**
    - **Build command:** `npm run build`
    - **Publish directory:** `dist`
6.  Click **Deploy**.

### Option 3: Manual Build
To build the project locally for production:
```bash
npm run build
```
The output will be in the `dist` folder, which can be served by any static file server.
