"""Configuration settings for BahaLa Na API"""

import os

# API Endpoints
CMR_SEARCH_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"
NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# Authentication
EARTHDATA_JWT = os.getenv("EARTHDATA_JWT")

# Dataset Configuration
IMERG_DATASET_NAME = "GPM_3IMERGDL"

# API Settings
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
REQUEST_TIMEOUT = 60.0
DOWNLOAD_TIMEOUT = 120.0
