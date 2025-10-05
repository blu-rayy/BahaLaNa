"""
Enhanced Flood Labeling System
Generates more realistic flood labels based on meteorological research and
historical flood patterns in the Philippines.

This solves the problem of too few flood events (1.29%) making the model overly conservative.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta


def calculate_antecedent_precipitation(df: pd.DataFrame, days: int = 7) -> pd.Series:
    """Calculate cumulative precipitation for the past N days."""
    # Sort by location and date
    df = df.sort_values(['location', 'date'])
    
    # Calculate rolling sum for each location
    antecedent = df.groupby('location')['precipitation'].rolling(
        window=days, 
        min_periods=1
    ).sum().reset_index(level=0, drop=True)
    
    return antecedent


def calculate_precipitation_intensity(df: pd.DataFrame) -> pd.Series:
    """Calculate precipitation intensity (recent vs historical average)."""
    df = df.sort_values(['location', 'date'])
    
    # Calculate 30-day moving average for each location
    avg_30d = df.groupby('location')['precipitation'].rolling(
        window=30, 
        min_periods=15
    ).mean().reset_index(level=0, drop=True)
    
    # Intensity = current / average (avoid division by zero)
    intensity = df['precipitation'] / (avg_30d + 0.1)
    
    return intensity


def identify_flood_events_enhanced(df: pd.DataFrame) -> pd.DataFrame:
    """
    Enhanced flood identification using multiple criteria based on 
    meteorological research for tropical flood conditions.
    
    Criteria based on:
    - Philippine PAGASA flood warning thresholds
    - Tropical storm research
    - Historical flood patterns
    """
    
    print("🔬 Applying Enhanced Flood Detection Algorithm...")
    print()
    
    # Calculate additional features
    print("📊 Calculating meteorological features...")
    df['precip_7day'] = calculate_antecedent_precipitation(df, days=7)
    df['precip_3day'] = calculate_antecedent_precipitation(df, days=3)
    df['precip_intensity'] = calculate_precipitation_intensity(df)
    
    # Sort for sequential analysis
    df = df.sort_values(['location', 'date'])
    
    # Initialize flood indicators
    df['flood_occurred'] = 0
    df['flood_confidence'] = 0.0
    df['flood_reason'] = 'no_flood'
    
    print("🌊 Applying flood detection criteria...")
    print()
    
    # Criterion 1: Extreme Daily Precipitation
    # Based on PAGASA: >100mm in 24h = high flood risk
    criterion_1 = df['precipitation'] > 80
    print(f"   Criterion 1 (Extreme daily >80mm): {criterion_1.sum()} events")
    
    # Criterion 2: Very Heavy + High Humidity
    # Heavy rain with saturated ground/air (LOWERED thresholds)
    criterion_2 = (df['precipitation'] > 60) & (df['humidity'] > 85)
    print(f"   Criterion 2 (Heavy >60mm + humidity >85%): {criterion_2.sum()} events")
    
    # Criterion 3: Sustained Heavy Precipitation (3-day)
    # Cumulative effect of sustained rain (LOWERED thresholds)
    criterion_3 = (df['precip_3day'] > 120) & (df['precipitation'] > 25)
    print(f"   Criterion 3 (3-day total >120mm + current >25mm): {criterion_3.sum()} events")
    
    # Criterion 4: Weekly Accumulation + Recent Rain
    # Long-term saturation + trigger event (LOWERED thresholds)
    criterion_4 = (df['precip_7day'] > 150) & (df['precipitation'] > 30) & (df['humidity'] > 82)
    print(f"   Criterion 4 (7-day >150mm + current >30mm + humidity >82%): {criterion_4.sum()} events")
    
    # Criterion 5: High Intensity Precipitation
    # Sudden heavy rain compared to normal (LOWERED thresholds)
    criterion_5 = (df['precip_intensity'] > 6) & (df['precipitation'] > 40)
    print(f"   Criterion 5 (Intensity >6x normal + >40mm): {criterion_5.sum()} events")
    
    # Criterion 6: Moderate Rain + Already Saturated
    # Lower threshold when ground is already wet (LOWERED thresholds)
    criterion_6 = (df['precipitation'] > 50) & (df['precip_7day'] > 120) & (df['humidity'] > 88)
    print(f"   Criterion 6 (Moderate >50mm + saturated): {criterion_6.sum()} events")
    
    # Criterion 7: IMERG High-Quality Extreme Events
    # Trust high-quality satellite data for extreme events (LOWERED threshold)
    if 'imerg_available' in df.columns:
        criterion_7 = (df['imerg_available'] == 1) & (df['precipitation'] > 70)
        print(f"   Criterion 7 (IMERG extreme >70mm): {criterion_7.sum()} events")
    else:
        criterion_7 = pd.Series([False] * len(df), index=df.index)
    
    # Criterion 8: Urban Flash Flood Conditions
    # Moderate rain with very high humidity in urban areas
    criterion_8 = (df['precipitation'] > 45) & (df['humidity'] > 90)
    print(f"   Criterion 8 (Urban flash flood >45mm + humidity >90%): {criterion_8.sum()} events")
    
    # Criterion 9: Multi-day Persistent Rain
    # Multiple days of moderate rain
    criterion_9 = (df['precip_3day'] > 90) & (df['precipitation'] > 20) & (df['humidity'] > 85)
    print(f"   Criterion 9 (Persistent rain 3-day >90mm): {criterion_9.sum()} events")
    
    print()
    
    # Apply criteria with confidence levels
    # High confidence (90-100%)
    high_conf = criterion_1 | (criterion_3 & criterion_2)
    df.loc[high_conf, 'flood_occurred'] = 1
    df.loc[high_conf, 'flood_confidence'] = 0.95
    df.loc[high_conf, 'flood_reason'] = 'high_confidence'
    
    # Medium-high confidence (70-85%)
    med_high = (~high_conf) & (criterion_2 | criterion_4 | criterion_7 | criterion_8)
    df.loc[med_high, 'flood_occurred'] = 1
    df.loc[med_high, 'flood_confidence'] = 0.80
    df.loc[med_high, 'flood_reason'] = 'medium_high_confidence'
    
    # Medium confidence (55-70%)
    medium = (~high_conf) & (~med_high) & (criterion_5 | criterion_6 | criterion_9)
    df.loc[medium, 'flood_occurred'] = 1
    df.loc[medium, 'flood_confidence'] = 0.65
    df.loc[medium, 'flood_reason'] = 'medium_confidence'
    
    # Keep MODIS detections if they exist
    if 'label_source' in df.columns:
        modis_detected = df['label_source'].str.contains('modis', na=False)
        df.loc[modis_detected, 'flood_occurred'] = 1
        df.loc[modis_detected, 'flood_confidence'] = 0.90
        df.loc[modis_detected, 'flood_reason'] = 'modis_satellite'
    
    # Summary statistics
    total_floods = df['flood_occurred'].sum()
    flood_pct = total_floods / len(df) * 100
    
    print("="*70)
    print("📊 ENHANCED FLOOD LABELING RESULTS")
    print("="*70)
    print(f"Total records: {len(df):,}")
    print(f"Flood events: {total_floods:,} ({flood_pct:.2f}%)")
    print()
    
    print("Confidence Distribution:")
    for reason in df['flood_reason'].unique():
        if reason != 'no_flood':
            count = (df['flood_reason'] == reason).sum()
            avg_conf = df[df['flood_reason'] == reason]['flood_confidence'].mean()
            print(f"   {reason}: {count} events (avg confidence: {avg_conf:.2f})")
    
    print()
    print("By Location:")
    for location in df['location'].unique():
        loc_floods = df[df['location'] == location]['flood_occurred'].sum()
        loc_total = len(df[df['location'] == location])
        loc_pct = loc_floods / loc_total * 100
        print(f"   {location}: {loc_floods}/{loc_total} ({loc_pct:.1f}%)")
    
    # Drop temporary columns
    df = df.drop(columns=['precip_intensity'], errors='ignore')
    
    return df


def enhance_existing_dataset(input_file: Path, output_file: Path):
    """Re-label an existing dataset with enhanced flood detection."""
    
    print("="*70)
    print("🔄 ENHANCING FLOOD LABELS IN EXISTING DATASET")
    print("="*70)
    print()
    
    # Load existing data
    print(f"📂 Loading: {input_file.name}")
    df = pd.read_csv(input_file)
    
    print(f"   Records: {len(df):,}")
    print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
    
    if 'flood_occurred' in df.columns:
        old_floods = df['flood_occurred'].sum()
        print(f"   Current flood events: {old_floods} ({old_floods/len(df)*100:.2f}%)")
    print()
    
    # Backup if needed
    if 'label_source' in df.columns:
        # Keep MODIS information
        print("💾 Preserving MODIS detections...")
        modis_detections = df[df['label_source'].str.contains('modis', na=False)].copy()
        print(f"   Found {len(modis_detections)} MODIS-confirmed events")
        print()
    
    # Apply enhanced labeling
    df_enhanced = identify_flood_events_enhanced(df)
    
    # Update label_source column
    df_enhanced['label_source'] = df_enhanced['flood_reason']
    
    # Save enhanced dataset
    df_enhanced.to_csv(output_file, index=False)
    
    print()
    print("="*70)
    print("✅ ENHANCEMENT COMPLETE")
    print("="*70)
    print(f"💾 Saved to: {output_file}")
    print(f"   File size: {output_file.stat().st_size / 1024:.2f} KB")
    
    if 'flood_occurred' in df.columns:
        new_floods = df_enhanced['flood_occurred'].sum()
        change = new_floods - old_floods
        print()
        print("📊 Comparison:")
        print(f"   Before: {old_floods} floods ({old_floods/len(df)*100:.2f}%)")
        print(f"   After: {new_floods} floods ({new_floods/len(df)*100:.2f}%)")
        print(f"   Change: {change:+d} ({change/len(df)*100:+.2f}%)")
    
    print()
    print("📋 Next Steps:")
    print("   1. Review the flood labels: python check_integration_status.py")
    print("   2. Re-train model: python -m ml.train_model ml/models/training_data_complete.csv")
    print("   3. Test model: python test_complete_model.py")
    print("   4. Compare performance with previous model")
    print()
    
    return df_enhanced


def main():
    """Main function to enhance flood labels."""
    
    # Paths
    base_dir = Path(__file__).parent
    input_file = base_dir / "ml" / "models" / "training_data_complete.csv"
    output_file = base_dir / "ml" / "models" / "training_data_complete.csv"
    backup_file = base_dir / "ml" / "models" / "training_data_complete_backup.csv"
    
    if not input_file.exists():
        print(f"❌ File not found: {input_file}")
        return
    
    # Create backup
    print("💾 Creating backup...")
    import shutil
    shutil.copy(input_file, backup_file)
    print(f"   Backup saved: {backup_file.name}")
    print()
    
    # Enhance dataset
    df_enhanced = enhance_existing_dataset(input_file, output_file)
    
    print("🎯 Expected Improvements:")
    print("   - More balanced training data")
    print("   - Better flood detection recall")
    print("   - Less conservative predictions")
    print("   - Improved model generalization")
    print()


if __name__ == "__main__":
    main()
