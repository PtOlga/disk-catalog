# 📀 Disk Catalog

Каталог домашних DVD и CD-книг. Сканирование штрихкода и OCR обложек, поиск по каталогу с телефона.

## Стек
- **Backend**: Python FastAPI → Google Cloud Run
- **База данных**: Firebase Firestore
- **OCR обложек**: Google Vision API
- **Фильмы**: OMDb API
- **Книги**: Open Library API
- **Frontend**: Vanilla JS PWA → Firebase Hosting

## Локальный запуск

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # заполнить ключи
uvicorn app.main:app --reload
```

Документация API: http://localhost:8000/docs

## Переменные окружения

| Переменная | Где взять |
|---|---|
| `OMDB_API_KEY` | omdbapi.com → бесплатный ключ |
| `GOOGLE_CLOUD_PROJECT` | console.cloud.google.com |
| `FIREBASE_CREDENTIALS_PATH` | Firebase → Service Account → JSON |

## Деплой

Push в ветку `main` → GitHub Actions автоматически деплоит бэкенд на Cloud Run.

Нужно добавить секреты в GitHub (Settings → Secrets):
- `GCP_CREDENTIALS` — JSON сервисного аккаунта GCP
- `GCP_PROJECT_ID` — ID проекта
- `OMDB_API_KEY` — ключ OMDb

## Структура проекта

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
│   ├── index.html        # список + поиск
│   ├── scan.html         # сканирование
│   └── js/
└── .github/workflows/    # CI/CD
```
