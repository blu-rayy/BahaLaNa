"""
Realistic Flood Testing - Based on actual Philippine flood patterns
Tests with scenarios matching the training data patterns
"""

import joblib
import json
import pandas as pd
import numpy as np
from pathlib import Path
from ml.feature_engineering import create_prediction_features


def load_model():
    """Load the trained model"""
    model_path = Path(__file__).parent / "ml" / "models" / "flood_model.pkl"
    model = joblib.load(model_path)
    return model


def test_realistic_scenario(model, name, precip, temp, humidity, wind):
    """Test with realistic Filipino flood patterns"""
    n = len(precip)
    temp = (temp + [temp[-1]] * n)[:n]
    humidity = (humidity + [humidity[-1]] * n)[:n]
    wind = (wind + [wind[-1]] * n)[:n]
    
    features = create_prediction_features(precip, temp, humidity, wind)
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    
    return {
        'scenario': name,
        'prediction': 'FLOOD' if prediction == 1 else 'NO FLOOD',
        'flood_prob': probabilities[1] * 100,
        'precip_today': precip[-1],
        'precip_7day': sum(precip[-7:]),
        'humidity_today': humidity[-1] if humidity else 0,
    }


def main():
    print("="*80)
    print("🌊 REALISTIC PHILIPPINE FLOOD PATTERN TESTING")
    print("="*80)
    print()
    
    model = load_model()
    
    # Load actual flood patterns from training data
    df = pd.read_csv(Path(__file__).parent / "ml" / "models" / "training_data_complete.csv")
    floods = df[df['flood_occurred'] == 1]
    
    print(f"Training data has {len(floods)} flood events")
    print(f"Precipitation range: {floods['precipitation'].min():.0f}-{floods['precipitation'].max():.0f}mm")
    print(f"7-day range: {floods['precip_7day'].min():.0f}-{floods['precip_7day'].max():.0f}mm")
    print()
    
    results = []
    
    # Test 1: Match actual training pattern - 207mm with moderate 7-day
    print("Test 1: Training data pattern (207mm, 263mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Actual Training Pattern",
        [10, 15, 18, 22, 28, 35, 42, 40, 35, 30, 25, 20, 18, 207],
        [26]*14, [90]*14, [3]*14
    ))
    
    # Test 2: Another training pattern - 206mm with 426mm 7-day
    print("Test 2: Training data pattern (206mm, 426mm 7-day)")
    results.append(test_realistic_scenario(
        model, "High 7-day Accumulation",
        [45, 50, 55, 60, 65, 70, 75, 70, 65, 60, 55, 50, 45, 206],
        [25]*14, [93]*14, [2]*14
    ))
    
    # Test 3: 157mm with 334mm 7-day (Manila pattern)
    print("Test 3: Manila pattern (157mm, 334mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Manila Flood Pattern",
        [30, 35, 40, 45, 50, 55, 60, 55, 50, 45, 40, 35, 30, 157],
        [26]*14, [93]*14, [3]*14
    ))
    
    # Test 4: Lower threshold - 110mm with moderate 7-day
    print("Test 4: Medium intensity (110mm, 180mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Medium Storm",
        [15, 18, 20, 22, 25, 28, 30, 28, 25, 22, 20, 18, 15, 110],
        [26]*14, [91]*14, [3]*14
    ))
    
    # Test 5: Continuous moderate - 115mm with 485mm 7-day (from training)
    print("Test 5: Continuous heavy (115mm peak, 485mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Sustained Heavy",
        [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115],
        [25]*14, [90]*14, [3]*14
    ))
    
    # Test 6: 80mm threshold test
    print("Test 6: Threshold test (80mm, 150mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Threshold 80mm",
        [10, 12, 15, 18, 20, 22, 25, 22, 20, 18, 15, 12, 10, 80],
        [26]*14, [88]*14, [3]*14
    ))
    
    # Test 7: 85mm with high humidity
    print("Test 7: 85mm + high humidity")
    results.append(test_realistic_scenario(
        model, "85mm + Humidity",
        [12, 15, 18, 20, 22, 25, 28, 25, 22, 20, 18, 15, 12, 85],
        [26]*14, [92]*14, [3]*14
    ))
    
    # Test 8: Normal wet season (no flood expected)
    print("Test 8: Normal wet season (35mm, 120mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Normal Wet Season",
        [15, 18, 20, 22, 18, 15, 12, 10, 12, 15, 18, 20, 22, 35],
        [27]*14, [85]*14, [2]*14
    ))
    
    # Test 9: Light rain (no flood)
    print("Test 9: Light rain (25mm, 90mm 7-day)")
    results.append(test_realistic_scenario(
        model, "Light Rain",
        [10, 12, 13, 14, 15, 14, 13, 12, 11, 10, 12, 14, 16, 25],
        [27]*14, [83]*14, [2]*14
    ))
    
    # Test 10: Dry (no flood)
    print("Test 10: Dry season (0mm)")
    results.append(test_realistic_scenario(
        model, "Dry Season",
        [0]*14,
        [29]*14, [70]*14, [2]*14
    ))
    
    print()
    print("="*80)
    print("📊 RESULTS")
    print("="*80)
    print()
    
    df_results = pd.DataFrame(results)
    
    for _, row in df_results.iterrows():
        symbol = "🌊" if row['prediction'] == 'FLOOD' else "✅"
        print(f"{symbol} {row['scenario']:<25} | Prob: {row['flood_prob']:5.1f}% | Today: {row['precip_today']:3.0f}mm | 7-day: {row['precip_7day']:3.0f}mm")
    
    print()
    print("="*80)
    print("ASSESSMENT")
    print("="*80)
    
    flood_count = sum(1 for r in results if r['prediction'] == 'FLOOD')
    extreme_count = sum(1 for r in results[:5] if r['prediction'] == 'FLOOD')
    threshold_count = sum(1 for r in results[5:7] if r['prediction'] == 'FLOOD')
    normal_count = sum(1 for r in results[7:] if r['prediction'] == 'FLOOD')
    
    print(f"\nFlood predictions: {flood_count}/10")
    print(f"  Extreme scenarios (should flood): {extreme_count}/5")
    print(f"  Threshold scenarios (may flood): {threshold_count}/2")
    print(f"  Normal/dry (should not flood): {normal_count}/3")
    print()
    
    if extreme_count >= 4:
        print("✅ GOOD: Model catches most realistic flood patterns")
    elif extreme_count >= 3:
        print("⚠️  MODERATE: Model catches some floods but misses others")
    elif extreme_count >= 1:
        print("⚠️  CONSERVATIVE: Model misses many realistic flood scenarios")
    else:
        print("❌ TOO CONSERVATIVE: Model doesn't predict floods at all")
    
    print()
    avg_prob = np.mean([r['flood_prob'] for r in results])
    print(f"Average flood probability: {avg_prob:.1f}%")
    
    if normal_count == 0 and flood_count > 0:
        print("✅ Good specificity: Not over-predicting on normal conditions")
    elif normal_count > 0:
        print("⚠️  May have false positives on normal conditions")
    
    print()


if __name__ == "__main__":
    main()
