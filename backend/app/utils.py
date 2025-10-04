"""Utility functions for data processing"""

# Optional imports for scientific datasets
try:
    import xarray as xr  # type: ignore
    HAS_XARRAY = True
except Exception:
    xr = None
    HAS_XARRAY = False


def has_xarray() -> bool:
    """Check if xarray is available"""
    return HAS_XARRAY


def get_xarray():
    """Get xarray module if available"""
    if not HAS_XARRAY:
        raise ImportError("xarray is not installed")
    return xr


def convert_date_format(date_str: str, to_format: str = "YYYYMMDD") -> str:
    """
    Convert date string between formats
    
    Args:
        date_str: Input date string (YYYY-MM-DD or YYYYMMDD)
        to_format: Target format ("YYYYMMDD" or "YYYY-MM-DD")
    
    Returns:
        Converted date string
    """
    if to_format == "YYYYMMDD":
        return date_str.replace("-", "")
    elif to_format == "YYYY-MM-DD":
        if len(date_str) == 8:
            return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
    return date_str


def calculate_bbox_center(bbox: str) -> tuple[float, float]:
    """
    Calculate center coordinates from bounding box
    
    Args:
        bbox: Bounding box string "minLon,minLat,maxLon,maxLat"
    
    Returns:
        Tuple of (latitude, longitude)
    """
    parts = bbox.split(",")
    min_lon, min_lat, max_lon, max_lat = map(float, parts)
    
    center_lon = (min_lon + max_lon) / 2
    center_lat = (min_lat + max_lat) / 2
    
    return center_lat, center_lon


def create_bbox_from_point(latitude: float, longitude: float, margin: float = 0.5) -> str:
    """
    Create bounding box around a point
    
    Args:
        latitude: Center latitude
        longitude: Center longitude
        margin: Margin in degrees (default 0.5)
    
    Returns:
        Bounding box string "minLon,minLat,maxLon,maxLat"
    """
    return f"{longitude-margin},{latitude-margin},{longitude+margin},{latitude+margin}"
