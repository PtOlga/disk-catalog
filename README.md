# 📀 Disk Catalog

A personal home catalog for DVD movies and CD audiobooks. Scan barcodes or photograph covers to add discs automatically, then search your collection from any phone.

## Stack
- **Backend**: Python FastAPI → Google Cloud Run
- **Database**: Firebase Firestore
- **Cover OCR**: Google Vision API
- **Movies**: OMDb API
- **Books**: Open Library API
- **Frontend**: Vanilla JS PWA → Firebase Hosting

## Local Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  #  Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in your keys
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/docs

## Environment Variables

| Variable | Where to get it |
|---|---|
| `OMDB_API_KEY` | omdbapi.com → free API key |
| `GOOGLE_CLOUD_PROJECT` | console.cloud.google.com |
| `FIREBASE_CREDENTIALS_PATH` | Firebase → Service Account → JSON |

## Deployment

Push to `main` branch → GitHub Actions automatically deploys the backend to Cloud Run.

Add the following secrets in GitHub (Settings → Secrets → Actions):
- `GCP_CREDENTIALS` — GCP service account JSON (full file contents)
- `GCP_PROJECT_ID` — your GCP project ID
- `OMDB_API_KEY` — your OMDb API key

## Project Structure

```
disk-catalog/
├── backend/              # FastAPI (Cloud Run)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/       # barcode, cover, catalog
│   │   ├── services/     # omdb, openlib, vision, firestore
│   │   └── models/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # PWA (Firebase Hosting)
│   ├── index.html        # catalog list + search
│   ├── scan.html         # disc scanning
│   └── js/
└── .github/workflows/    # CI/CD
```