import joblib
import numpy as np
import pandas as pd

# Load the new model
model_path = "./grid_search_model.pkl"
grid_search = joblib.load(model_path)

# Access the actual pipeline from the grid search
pipeline = grid_search.best_estimator_

print(f"Best parameters found: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.4f}")

# Create sample input matching the new model's expected format
sample_input = pd.DataFrame({
    'Temperature': [65.36],
    'Vibration': [3.36],
    'Power_Usage': [0.247],   #65.36582307	6.843872756	0.240147496	37.30704774	24.78354397	Type_A	1
    'Humidity': [37.72],      # 65.30525614	3.304745575	0.188422525	40.76375589	36.27464415	Type_A	0
    'Pressure': [36.94],  # New feature
    'Machine_Type': ['Type_A']  # String instead of code
})

print("\nSample input:")
print(sample_input)

# Inspect the preprocessing step
preprocessor = pipeline.named_steps['preprocessor']
transformed_data = preprocessor.transform(sample_input)
print(f"\nTransformed data shape: {transformed_data.shape}")

# Try to get feature names if possible
if hasattr(preprocessor, 'get_feature_names_out'):
    feature_names = preprocessor.get_feature_names_out()
    print("Transformed feature names:", feature_names)
    print("Number of features:", len(feature_names))

# Extract the model from the pipeline - use 'classifier' instead of 'model'
model = pipeline.named_steps['classifier']

# Use the transformed data directly - no trimming needed
try:
    # Get the model's prediction
    prediction = model.predict(transformed_data)
    
    print("\nPrediction for the data is:", prediction)
    if prediction[0] == 1:
        print("ALERT: Threshold exceeded! Maintenance required.")
    else:
        print("Status: Normal operation.")
        
    # Get probability if available
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(transformed_data)
        print(f"Failure probability: {probabilities[0][1]:.4f}")
        
except Exception as e:
    print(f"Prediction error: {e}")