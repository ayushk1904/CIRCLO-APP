# Circlo Free Deployment (Render + Vercel)

## 1. Security first
- Rotate all secrets currently present in `backend/.env` (MongoDB password, JWT secret, Cloudinary, Groq).
- Do not commit real `.env` files.

## 2. Deploy backend on Render (Free Web Service)
1. Push project to GitHub.
2. In Render: `New` -> `Web Service`.
3. Connect repo and set:
   - `Root Directory`: `backend`
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
4. Add environment variables from `backend/.env.example`:
   - `PORT=5000`
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`
   - `GROQ_API_KEY=...`
   - `CORS_ORIGINS=https://<your-frontend-domain>.vercel.app,http://localhost:3000`
5. Deploy and copy backend URL, e.g. `https://circlo-api.onrender.com`.

## 3. Deploy frontend on Vercel (Free)
1. In Vercel: `Add New` -> `Project`.
2. Import same repo and set:
   - `Root Directory`: `frontend/frontend`
   - Framework preset: `Create React App`
3. Add env vars:
   - `REACT_APP_API_URL=https://<your-render-backend>/api`
   - `REACT_APP_FILE_URL=https://<your-render-backend>`
   - `REACT_APP_SOCKET_URL=https://<your-render-backend>`
4. Deploy and copy frontend URL.

## 4. Final CORS update
- Go back to Render backend env var `CORS_ORIGINS`.
- Ensure it includes exact frontend URL (no trailing slash), e.g.:
  - `https://circlo.vercel.app,http://localhost:3000`
- Redeploy backend once.

## 5. Verify
1. Open frontend URL.
2. Register/login.
3. Open a circle and send messages.
4. Test audio/video call in two browser windows.

## Notes
- WebRTC call quality/NAT traversal is best with TURN servers. Current setup uses STUN only.
- Free tiers may sleep after inactivity (first request can be slow).
