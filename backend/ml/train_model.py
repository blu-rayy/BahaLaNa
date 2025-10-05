"""Train flood prediction model using XGBoost"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
from xgboost import XGBClassifier
import joblib
import json
from pathlib import Path

from .feature_engineering import create_features, select_feature_columns


def train_flood_model(
    data_file: str,
    model_output: str = None,
    test_size: float = 0.2,
    random_state: int = 42
):
    """
    Train flood prediction model.
    
    Args:
        data_file: Path to merged dataset CSV with columns:
                   date, location, latitude, longitude,
                   precipitation, temperature, humidity, wind_speed,
                   flood_occurred (0 or 1)
        model_output: Where to save trained model (default: backend/ml/models/flood_model.pkl)
        test_size: Proportion for test set
        random_state: Random seed for reproducibility
    
    Returns:
        Trained model
    """
    if model_output is None:
        model_output = str(Path(__file__).parent / "models" / "flood_model.pkl")
    
    # Load data
    print("📂 Loading data...")
    df = pd.read_csv(data_file)
    print(f"   Loaded {len(df)} records")
    
    # Feature engineering
    print("\n🔧 Creating features...")
    df = create_features(df)
    
    # Remove rows with NaN (from lag/rolling features)
    df_clean = df.dropna()
    print(f"   {len(df_clean)} records after removing NaN")
    
    # Split features and target
    feature_cols = select_feature_columns()
    X = df_clean[feature_cols]
    y = df_clean['flood_occurred']
    
    print(f"\n📊 Dataset shape: {X.shape}")
    print(f"   Positive samples (floods): {y.sum()} ({y.mean()*100:.1f}%)")
    print(f"   Negative samples (no flood): {len(y) - y.sum()} ({(1-y.mean())*100:.1f}%)")
    
    if y.sum() < 10:
        print("\n⚠️  WARNING: Very few positive samples! Model may not perform well.")
        print("   Consider collecting more historical flood data.")
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    print(f"\n📈 Training set: {len(X_train)} samples")
    print(f"   Test set: {len(X_test)} samples")
    
    # Calculate scale_pos_weight for imbalanced data
    # Ratio of negative to positive samples
    if y_train.sum() > 0:
        scale_pos_weight = (len(y_train) - y_train.sum()) / y_train.sum()
    else:
        print("   ⚠️  No positive samples, using default weight")
        scale_pos_weight = 1.0
    print(f"   Scale pos weight: {scale_pos_weight:.2f}")
    
    # Train model
    print("\n🚀 Training XGBoost Classifier (Gradient Boosting)...")
    model = XGBClassifier(
        n_estimators=200,           # Number of boosting rounds
        max_depth=10,               # Maximum tree depth
        learning_rate=0.1,          # Step size shrinkage (eta)
        subsample=0.8,              # Subsample ratio of training instances
        colsample_bytree=0.8,       # Subsample ratio of features
        scale_pos_weight=scale_pos_weight,  # Handle imbalanced data
        min_child_weight=5,         # Minimum sum of instance weight
        gamma=0.1,                  # Minimum loss reduction for split
        reg_alpha=0.1,              # L1 regularization
        reg_lambda=1.0,             # L2 regularization
        random_state=random_state,
        eval_metric='logloss',      # Evaluation metric
        n_jobs=-1,
        verbosity=1
    )
    
    model.fit(X_train, y_train)
    print("   ✅ Training complete!")
    
    # Evaluate on training set
    print("\n" + "="*60)
    print("TRAINING SET PERFORMANCE")
    print("="*60)
    train_pred = model.predict(X_train)
    print(classification_report(y_train, train_pred, target_names=['No Flood', 'Flood']))
    
    # Evaluate on test set
    print("\n" + "="*60)
    print("TEST SET PERFORMANCE")
    print("="*60)
    test_pred = model.predict(X_test)
    print(classification_report(y_test, test_pred, target_names=['No Flood', 'Flood']))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, test_pred)
    print("\nConfusion Matrix:")
    print(f"                Predicted No Flood    Predicted Flood")
    print(f"Actual No Flood        {cm[0,0]:6d}              {cm[0,1]:6d}")
    print(f"Actual Flood           {cm[1,0]:6d}              {cm[1,1]:6d}")
    
    # Feature importance (using gain for XGBoost)
    importance_dict = model.get_booster().get_score(importance_type='gain')
    
    # Map feature indices back to names
    feature_importance_values = []
    for i, col in enumerate(feature_cols):
        feature_name = f"f{i}"
        importance = importance_dict.get(feature_name, 0)
        feature_importance_values.append(importance)
    
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': feature_importance_values
    }).sort_values('importance', ascending=False)
    
    print("\n" + "="*60)
    print("TOP 10 IMPORTANT FEATURES (by gain)")
    print("="*60)
    for idx, row in feature_importance.head(10).iterrows():
        print(f"{row['feature']:30s} {row['importance']:.4f}")
    
    # Cross-validation
    print("\n" + "="*60)
    print("CROSS-VALIDATION (5-fold)")
    print("="*60)
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1')
    print(f"F1 Scores: {[f'{s:.3f}' for s in cv_scores]}")
    print(f"Mean F1: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
    
    # Save model
    print(f"\n💾 Saving model to {model_output}")
    Path(model_output).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_output)
    
    # Save feature names and metadata
    test_accuracy = float((test_pred == y_test).mean())
    
    metadata = {
        'model_type': 'XGBoost (Gradient Boosting)',
        'feature_columns': feature_cols,
        'train_date': pd.Timestamp.now().isoformat(),
        'train_size': len(X_train),
        'test_size': len(X_test),
        'test_accuracy': test_accuracy,
        'test_f1_score': float(cv_scores.mean()),
        'positive_samples': int(y.sum()),
        'negative_samples': int(len(y) - y.sum()),
        'scale_pos_weight': float(scale_pos_weight),
        'model_params': model.get_params(),
        'feature_importance': feature_importance.to_dict('records')
    }
    
    metadata_file = str(Path(model_output).with_suffix('.json'))
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"💾 Saved metadata to {metadata_file}")
    print("\n✅ Training complete! Model ready for deployment.")
    
    return model


def train_with_sample_data():
    """
    Train with synthetic sample data for demonstration.
    Use this to test the pipeline before collecting real data.
    """
    print("⚠️  Using synthetic sample data for demonstration")
    print("   Replace with real data for production use!\n")
    
    # Generate synthetic data
    np.random.seed(42)
    n_samples = 1000
    
    # Simulate different scenarios
    dates = pd.date_range(start='2020-01-01', periods=n_samples, freq='D')
    locations = ['Manila', 'Cebu', 'Davao'] * (n_samples // 3 + 1)
    
    data = []
    for i, date in enumerate(dates):
        location = locations[i]
        
        # Base precipitation (higher during wet season)
        month = date.month
        is_wet = month in [6, 7, 8, 9, 10]
        
        # Generate precipitation with some extreme events
        if np.random.rand() < 0.15:  # 15% chance of high rainfall
            base_precip = np.random.uniform(50, 150)  # Heavy rain
        elif is_wet:
            base_precip = np.random.gamma(2, 8)  # Normal wet season
        else:
            base_precip = np.random.gamma(1, 3)  # Normal dry season
        
        # Temperature (lower during wet season)
        temp = 27 + np.random.randn() * 2 - (3 if is_wet else 0)
        
        # Humidity (higher during wet season)
        humidity = (75 if is_wet else 65) + np.random.randn() * 10
        humidity = max(50, min(100, humidity))  # Clamp between 50-100%
        
        # Wind speed
        wind = 3 + np.random.randn() * 1.5
        wind = max(0, wind)  # No negative wind
        
        # Flood occurs if high precipitation (simplified rule)
        flood = 1 if base_precip > 60 else 0
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'location': location,
            'latitude': 14.5 + np.random.randn() * 0.1,
            'longitude': 121.0 + np.random.randn() * 0.1,
            'precipitation': base_precip,
            'temperature': temp,
            'humidity': humidity,
            'wind_speed': wind,
            'flood_occurred': flood
        })
    
    df = pd.DataFrame(data)
    
    # Save to temp file
    temp_file = Path(__file__).parent / "models" / "sample_data.csv"
    temp_file.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(temp_file, index=False)
    
    print(f"Generated {len(df)} synthetic records")
    print(f"Flood events: {df['flood_occurred'].sum()}\n")
    
    # Train model
    return train_flood_model(str(temp_file))


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Train with provided data file
        data_file = sys.argv[1]
        train_flood_model(data_file)
    else:
        # Train with sample data
        print("Usage: python train_model.py <data_file.csv>")
        print("No data file provided, using synthetic sample data...\n")
        train_with_sample_data()
