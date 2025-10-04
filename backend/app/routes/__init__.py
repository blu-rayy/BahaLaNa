"""Routes package initialization"""

from fastapi import APIRouter

# Create main router
api_router = APIRouter()

# Import and include route modules
from .health import router as health_router
from .imerg import router as imerg_router
from .power import router as power_router
from .flood_risk import router as flood_risk_router

api_router.include_router(health_router, tags=["health"])
api_router.include_router(imerg_router, prefix="/imerg", tags=["imerg"])
api_router.include_router(power_router, prefix="/power", tags=["power"])
api_router.include_router(flood_risk_router, prefix="/flood-risk", tags=["flood-risk"])
