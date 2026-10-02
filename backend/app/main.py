import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.router import api_router

# Load environment variables from .env file if it exists
load_dotenv()

app = FastAPI(
    title="ResearchIQ Backend",
    description="Backend API for the ResearchIQ research intelligence platform.",
    version="0.1.0"
)

# Configure CORS: read FRONTEND_URL from environment, fallback to http://localhost:3000
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "ResearchIQ Backend API is running",
        "docs": "/docs",
        "health": "/health",
        "version": "0.1.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "researchiq-backend"
    }
