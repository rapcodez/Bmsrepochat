# BMS Cognitive ERP Assistant

A React-based Proof of Concept (POC) for an Enterprise Resource Planning tool featuring a simulated AI assistant.
# BMS Cognitive ERP Assistant

A React-based Proof of Concept (POC) for an Enterprise Resource Planning tool featuring a simulated AI assistant.

## Features
- **AI Assistant:** Mock AI engine for inventory and order queries (No API key required).
- **Dashboard:** Real-time charts and KPIs.
- **Role-Based Access:** Admin, Sales, Customer views.

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1.  Import this repository into Vercel.
2.  **Add Environment Variable:**
    *   Key: `VITE_HF_TOKEN`
    *   Value: `Your_Hugging_Face_Token` (Get one for free at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))
3.  Vercel will automatically detect Vite and deploy.

### Option 2: Netlify
1.  Import this repository into Netlify.
2.  **Add Environment Variable:**
    *   Key: `VITE_HF_TOKEN`
    *   Value: `Your_Hugging_Face_Token`
3.  Build command: `npm run build`
4.  Publish directory: `dist`

## 🧠 AI Engine
This app uses a **Hybrid AI Engine**:
1.  **Real AI (Hugging Face):** If a valid `VITE_HF_TOKEN` is provided, it uses the **Mistral-7B-Instruct** model via Hugging Face Inference API to answer questions based on the live ERP data.
2.  **Mock AI (Fallback):** If no token is provided or the API fails, it seamlessly falls back to a robust local Regex-based engine, ensuring the demo never breaks.
