"""Feature engineering for flood prediction"""
import pandas as pd
import numpy as np


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create ML features from raw IMERG and climate data.
    
    Expected columns in df:
    - date, location, latitude, longitude
    - precipitation, temperature, humidity, wind_speed
    - flood_occurred (target variable)
    
    Returns:
        DataFrame with engineered features
    """
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(['location', 'date'])
    
    # Group by location for temporal features
    grouped = df.groupby('location')
    
    # === Precipitation Features ===
    df['precip_7day_sum'] = grouped['precipitation'].transform(
        lambda x: x.rolling(7, min_periods=1).sum()
    )
    df['precip_7day_max'] = grouped['precipitation'].transform(
        lambda x: x.rolling(7, min_periods=1).max()
    )
    df['precip_3day_sum'] = grouped['precipitation'].transform(
        lambda x: x.rolling(3, min_periods=1).sum()
    )
    df['precip_14day_avg'] = grouped['precipitation'].transform(
        lambda x: x.rolling(14, min_periods=1).mean()
    )
    
    # Consecutive rainy days
    df['is_rainy_day'] = (df['precipitation'] > 5).astype(int)
    df['consecutive_rainy_days'] = grouped['is_rainy_day'].transform(
        lambda x: x.groupby((x != x.shift()).cumsum()).cumsum()
    )
    
    # Rate of change
    df['precip_rate_of_change'] = grouped['precipitation'].transform(
        lambda x: x.diff()
    )
    
    # === Temperature Features ===
    df['temp_7day_avg'] = grouped['temperature'].transform(
        lambda x: x.rolling(7, min_periods=1).mean()
    )
    
    # === Humidity Features ===
    df['humidity_7day_avg'] = grouped['humidity'].transform(
        lambda x: x.rolling(7, min_periods=1).mean()
    )
    df['high_humidity'] = (df['humidity'] > 80).astype(int)
    
    # === Temporal Features ===
    df['day_of_year'] = df['date'].dt.dayofyear
    df['month'] = df['date'].dt.month
    # Wet season in Philippines: June-October
    df['is_wet_season'] = df['month'].isin([6, 7, 8, 9, 10]).astype(int)
    
    # === Interaction Features ===
    df['precip_humidity_interaction'] = df['precipitation'] * df['humidity'] / 100
    
    # === Lag Features (previous day conditions) ===
    for col in ['precipitation', 'temperature', 'humidity']:
        df[f'{col}_lag1'] = grouped[col].shift(1)
        df[f'{col}_lag3'] = grouped[col].shift(3)
    
    return df


def select_feature_columns() -> list[str]:
    """Return list of feature columns for ML training."""
    return [
        # Precipitation features
        'precipitation',
        'precip_7day_sum',
        'precip_7day_max',
        'precip_3day_sum',
        'precip_14day_avg',
        'consecutive_rainy_days',
        'precip_rate_of_change',
        
        # Climate features
        'temperature',
        'temp_7day_avg',
        'humidity',
        'humidity_7day_avg',
        'high_humidity',
        'wind_speed',
        
        # Temporal features
        'day_of_year',
        'month',
        'is_wet_season',
        
        # Interaction features
        'precip_humidity_interaction',
        
        # Lag features
        'precipitation_lag1',
        'precipitation_lag3',
        'temperature_lag1',
        'humidity_lag1'
    ]


def create_prediction_features(
    precipitation: list[float],
    temperature: list[float],
    humidity: list[float],
    wind_speed: list[float],
    dates: list[str] = None
) -> pd.DataFrame:
    """
    Create features from recent observations for real-time prediction.
    Must match feature engineering used in training.
    
    Args:
        precipitation: List of daily precipitation values (most recent last)
        temperature: List of daily temperature values
        humidity: List of daily humidity values
        wind_speed: List of daily wind speed values
        dates: Optional list of date strings
    
    Returns:
        DataFrame with features for the most recent day
    """
    if dates is None:
        dates = pd.date_range(end=pd.Timestamp.now(), periods=len(precipitation), freq='D')
    
    df = pd.DataFrame({
        'date': dates,
        'precipitation': precipitation,
        'temperature': temperature,
        'humidity': humidity,
        'wind_speed': wind_speed,
        'location': 'prediction',  # Dummy location for grouping
        'flood_occurred': 0  # Not used in prediction
    })
    
    # Apply same feature engineering
    df = create_features(df)
    
    # Return only the last row (most recent)
    return df.iloc[[-1]][select_feature_columns()]
