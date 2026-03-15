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
5. Click **Advanced** at the bottom of the page. Under the **Environment Variables** section, click **Add Environment Variable** for each of the following (copy values from your local `server/.env`):
   - Key: `SUPABASE_URL` | Value: `your-url`
   - Key: `SUPABASE_SERVICE_KEY` | Value: `your-service-key`
   - Key: `SUPABASE_DB_URL` | Value: `your-db-string`
   - Key: `GEMINI_API_KEY` | Value: `your-gemini-key`
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
5. Click **Advanced**. Under **Environment Variables**, click **Add Environment Variable** for each of the following (from your local `client/.env`):
   - Key: `VITE_SUPABASE_URL` | Value: `your-url`
   - Key: `VITE_SUPABASE_KEY` | Value: `your-key`
   - Key: `VITE_GOOGLE_MAPS_KEY` | Value: `your-maps-key`
   - Key: `VITE_API_URL` | Value: `https://ingec-server.onrender.com/api` (Replace with the URL generated in Step 1!)
   - *Optional:* Add the `REACT_APP_` equivalents as well.
6. Click **Create Static Site**.
