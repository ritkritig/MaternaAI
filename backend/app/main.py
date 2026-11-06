import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, dashboard, datasets, analysis, map, ml, accessibility, insights

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MaternaAI")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local Vite frontend dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route handlers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(datasets.router, prefix="/api", tags=["Datasets"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(map.router, prefix="/api", tags=["Geospatial Map"])
app.include_router(ml.router, prefix="/api", tags=["Machine Learning"])
app.include_router(accessibility.router, prefix="/api", tags=["Accessibility Index"])
app.include_router(insights.router, prefix="/api", tags=["Research Insights"])

@app.on_event("startup")
async def startup_event():
    logger.info(f"{settings.PROJECT_NAME} v{settings.VERSION} backend service initialized.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
