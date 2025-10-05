# Dataset Fetching Scripts

This directory contains scripts to fetch NASA datasets for flood prediction:

1. **IMERG** - Satellite precipitation data  
2. **POWER** - Ground-based climate data

## Quick Start

### Fetch Both Datasets (Recommended)

```powershell
cd backend
python scripts/fetch_all_datasets.py
```

### Fetch Individually

```powershell
python scripts/fetch_imerg_data.py  # Precipitation
python scripts/fetch_power_data.py  # Climate data
```

## Output Files

Saved to `backend/ml/models/`:
- `imerg_data.csv` - IMERG satellite precipitation
- `power_data.csv` - NASA POWER climate data

## Dataset Details

### IMERG - Satellite Precipitation
- **Product:** GPM_3IMERGDF_06 (IMERG Final Run Daily)
- **Resolution:** 0.1° (~11km), 30-min aggregated to daily
- **Coverage:** Global, 2000-present
- **Requires:** NASA Earthdata credentials

### POWER - Ground Climate Data
- **Product:** NASA POWER v2 API
- **Variables:** Temperature, humidity, wind speed, precipitation
- **Resolution:** 0.5° (~55km), daily
- **Coverage:** Global, 1981-present
- **Requires:** None (public API)

## Setup

### IMERG Credentials

```powershell
$env:EARTHDATA_USERNAME = "your_username"
$env:EARTHDATA_PASSWORD = "your_password"
```

Register at: https://urs.earthdata.nasa.gov/

## Configuration

Default settings:
- **Date range:** 2023-01-01 to 2025-09-30
- **Locations:** Manila, Cagayan, Marikina, Quezon City, Bulacan
- **Records:** ~5,020 (1,004 days × 5 locations)

## Expected Results

| Dataset | Size | Time | Records |
|---------|------|------|---------|
| IMERG | 280KB | 5-10 min | 5,020 |
| POWER | 316KB | 2-3 min | 5,020 |
| **Total** | **~600KB** | **~12 min** | **5,020** |

## Next Steps

After fetching data:

1. **Enhanced Labeling:** `python enhance_flood_labels.py`
2. **Train Model:** `python ml/train_model.py`
3. **Test Model:** `python test_complete_model.py`

## APIs Used

- **IMERG:** https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGDF_06/summary
- **POWER:** https://power.larc.nasa.gov/docs/

## Notes

- Both datasets are NASA-validated and quality-controlled
- IMERG uses radar-based measurements (cloud-independent)
- POWER uses reanalysis models with ground station data
- All data is publicly available under NASA's data policy
