"""IMERG data endpoints"""

from fastapi import APIRouter, Header, HTTPException
import httpx
import os
import tempfile

from ..models import ImergRequest
from ..config import CMR_SEARCH_URL, EARTHDATA_JWT, IMERG_DATASET_NAME
from ..utils import has_xarray, get_xarray

router = APIRouter()


@router.post("")
async def fetch_imerg(req: ImergRequest, authorization: str = Header(None)):
    """Fetch IMERG granule(s) from CMR and return a small summary."""

    if not authorization:
        if EARTHDATA_JWT:
            authorization = f"Bearer {EARTHDATA_JWT}"
        else:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header. Provide 'Bearer <token>' or set EARTHDATA_JWT environment variable."
            )

    params = {
        "short_name": IMERG_DATASET_NAME,
        "page_size": 10,
        "sort_key": "start_date",
        "temporal": f"{req.start_date}T00:00:00Z/{req.end_date}T23:59:59Z",
    }
    if req.bbox:
        params["bounding_box"] = req.bbox

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.get(CMR_SEARCH_URL, params=params)
        r.raise_for_status()
        results = r.json()

    items = results.get("feed", {}).get("entry", [])
    if not items:
        raise HTTPException(status_code=404, detail="No IMERG granules found for the query")

    granule = items[0]
    links = granule.get("links", [])

    # Find a download URL
    download_url = None
    for L in links:
        href = L.get("href")
        rel = L.get("rel", "")
        type_ = L.get("type", "")
        if href and ("data" in rel or type_ in ("application/x-hdf", "application/x-netcdf", "application/octet-stream")):
            download_url = href
            break
    if not download_url:
        for L in links:
            if L.get("href"):
                download_url = L.get("href")
                break

    if not download_url:
        raise HTTPException(status_code=404, detail="No downloadable URL found")

    headers = {"Authorization": authorization}
    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        resp = await client.get(download_url, headers=headers)
        resp.raise_for_status()
        content = resp.content

    # Save to temporary file
    suffix = os.path.splitext(download_url)[1] or ".h5"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    with open(tmp_path, "wb") as f:
        f.write(content)

    if has_xarray():
        try:
            xr = get_xarray()
            ds = xr.open_dataset(tmp_path)
            summary = {v: list(ds[v].shape) for v in ds.data_vars}
            coords = {c: list(ds[c].values.shape) if hasattr(ds[c].values, 'shape') else None for c in ds.coords}

            precip_sample = None
            for candidate in ("precipitationCal", "precipitation", "rainfall", "precip"):
                if candidate in ds:
                    try:
                        precip_sample = float(ds[candidate].mean().item())
                    except Exception:
                        precip_sample = None
                    break

            ds.close()
            os.remove(tmp_path)
            return {
                "granule_id": granule.get("id"),
                "download_url": download_url,
                "variables": summary,
                "coords": coords,
                "precip_mean_sample": precip_sample,
            }
        except Exception as e:
            os.remove(tmp_path)
            raise HTTPException(status_code=500, detail=f"Failed to open dataset: {str(e)}")

    return {
        "granule_id": granule.get("id"),
        "download_url": download_url,
        "note": "xarray not installed; file downloaded locally",
        "local_temp_path": tmp_path,
    }


@router.post("/metadata")
async def imerg_metadata(req: ImergRequest, authorization: str = Header(None)):
    """Return metadata for IMERG granules from CMR (no downloads)."""
    if not authorization:
        if EARTHDATA_JWT:
            authorization = f"Bearer {EARTHDATA_JWT}"
        else:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header. Provide 'Bearer <token>' or set EARTHDATA_JWT environment variable."
            )

    params = {
        "short_name": IMERG_DATASET_NAME,
        "page_size": 20,
        "sort_key": "start_date",
        "temporal": f"{req.start_date}T00:00:00Z/{req.end_date}T23:59:59Z",
    }
    if req.bbox:
        params["bounding_box"] = req.bbox

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(CMR_SEARCH_URL, params=params)
        r.raise_for_status()
        results = r.json()

    entries = results.get("feed", {}).get("entry", [])
    granules = []
    for g in entries:
        granules.append({
            "id": g.get("id"),
            "title": g.get("title"),
            "start_time": g.get("time_start"),
            "end_time": g.get("time_end"),
            "size": g.get("granule_size"),
            "links": g.get("links", []),
        })

    return {
        "total_hits": results.get("feed", {}).get("hits", len(entries)),
        "count": len(granules),
        "granules": granules
    }
