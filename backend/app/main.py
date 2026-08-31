from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.ml import router as ml_router

app = FastAPI(title="FieldHub Coal Safety API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ml_router, prefix="/api/v1/ml", tags=["ML Predictions"])

@app.get("/")
def root():
    return {"status": "healthy", "service": "FieldHub Coal Safety Backend"}

@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
