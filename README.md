# BMS Cognitive ERP Assistant

A React-based Proof of Concept (POC) for an Enterprise Resource Planning tool featuring a simulated AI assistant.
# BMS Cognitive ERP Assistant

A React-based Proof of Concept (POC) for an Enterprise Resource Planning tool featuring a simulated AI assistant.

## Features
- **AI Assistant:** Mock AI engine for inventory and order queries (No API key required).
- **Dashboard:** Real-time charts and KPIs.
- **Role-Based Access:** Admin, Sales, Customer views.

## 🚀 Deployment

### Option 1: Vercel / Netlify (Zero Config)
1.  Import this repository.
2.  Deploy.
3.  **That's it!** No environment variables are needed for deployment.
4.  Open the app, click the **Settings (Gear)** icon, and paste your Hugging Face Token.

## 🧠 AI Engine
This app uses a **Hybrid AI Engine**:
1.  **Real AI (Hugging Face):**
    - Click the **Settings** icon in the chat header.
    - Paste your free **Hugging Face Token** (Read permissions).
    - The app saves it securely in your browser's **Local Storage**.
    - It then uses **Mistral-7B-Instruct** to answer questions based on live ERP data.
2.  **Mock AI (Fallback):** If no token is provided, it seamlessly falls back to a robust local Regex-based engine.

