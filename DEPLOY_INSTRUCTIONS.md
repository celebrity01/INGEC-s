# Render Deployment Instructions (Free Tier)

Since Render Blueprints (`render.yaml`) require a credit card, you can deploy both services manually for free using the Render Dashboard.

## 1. Deploy the Backend (Node.js/Express)
1. Go to your Render Dashboard (https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect this GitHub repository.
4. Fill in the deployment details:
   - **Name**: `ingec-server`
   - **Language**: `Node`
   - **Branch**: `main` (or whichever branch you push this to)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free**.
5. Click **Advanced** and add the following Environment Variables (from your local `server/.env`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_DB_URL`
   - `ANTHROPIC_API_KEY`
6. Click **Create Web Service**. Wait for the URL to be generated (e.g., `https://ingec-server.onrender.com`).

## 2. Deploy the Frontend (React/Vite)
1. Go back to your Render Dashboard.
2. Click **New +** and select **Static Site**.
3. Connect the same GitHub repository.
4. Fill in the deployment details:
   - **Name**: `ingec-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Click **Advanced** and add the following Environment Variables (from your local `client/.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
   - `VITE_GOOGLE_MAPS_KEY`
   - `VITE_API_URL` -> Set this to the backend URL you generated in Step 1 (e.g., `https://ingec-server.onrender.com/api`).
   - *Optional:* Add the `REACT_APP_` equivalents as well.
6. Click **Create Static Site**.
