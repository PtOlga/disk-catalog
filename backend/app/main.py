from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import barcode, cover, catalog

app = FastAPI(title="Disk Catalog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(barcode.router, prefix="/scan", tags=["scan"])
app.include_router(cover.router, prefix="/scan", tags=["scan"])
app.include_router(catalog.router, prefix="/catalog", tags=["catalog"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Disk Catalog API"}