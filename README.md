# FarmToMarket (AgriMarket Pro)

A dashboard that helps farmers track crop prices, compare nearby markets, watch
weather alerts and estimate profit. It includes an AI assistant (Azure OpenAI +
Azure Speech) that can update farm data from text or voice.

## Project layout

- `src/` – React + Vite frontend
- `backend/` – Flask API backed by PostgreSQL

## Running the frontend

```bash
npm install
npm run dev      # starts Vite on http://localhost:3000
npm run build    # production build in ./build
```

Requests to `/api/*` are proxied to the Flask server on port 5000 during development.

## Running the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in your values
python init_db.py      # create tables
python app.py
```
