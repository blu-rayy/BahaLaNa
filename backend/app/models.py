"""Pydantic models for request/response validation"""

from pydantic import BaseModel


class ImergRequest(BaseModel):
    """Request model for IMERG data queries"""
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    bbox: str | None = None  # minLon,minLat,maxLon,maxLat


class PowerRequest(BaseModel):
    """Request model for NASA POWER API queries"""
    start_date: str  # YYYYMMDD
    end_date: str    # YYYYMMDD
    latitude: float
    longitude: float
    parameters: str | None = "T2M,PRECTOTCORR,RH2M,WS2M"  # Temperature, Precipitation, Humidity, Wind Speed
    community: str | None = "AG"  # AG=Agroclimatology (good for flood/agriculture)


class FloodRiskRequest(BaseModel):
    """Request model for flood risk assessment"""
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    latitude: float
    longitude: float
