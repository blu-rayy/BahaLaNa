"""Health check endpoint"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "BahaLa Na Climate Data API",
        "version": "1.0.0",
        "endpoints": {
            "imerg": "/api/imerg",
            "power": "/api/power/climate",
            "flood_risk": "/api/flood-risk"
        }
    }
