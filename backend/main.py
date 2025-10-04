"""
BahaLa Na - NASA Climate Data API
Main application entry point

From "bahala na" to "may plano na" - Flood awareness through data
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import api_router

# Create FastAPI application
app = FastAPI(
    title="BahaLa Na Climate Data API",
    description="NASA IMERG rainfall + POWER climate data for flood risk assessment",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "BahaLa Na Climate Data API",
        "version": "1.0.0",
        "tagline": "From bahala na to may plano na",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/",
            "imerg_metadata": "/api/imerg/metadata",
            "imerg_download": "/api/imerg",
            "power_climate": "/api/power/climate",
            "flood_risk": "/api/flood-risk"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
