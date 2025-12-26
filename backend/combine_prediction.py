import joblib
from sklearn.pipeline import Pipeline

# Load your already saved preprocessor and model.
# Make sure these files are in the same folder as this script or provide the correct relative paths.
preproc = joblib.load("./models/preproc.joblib")
model = joblib.load("./models/rf_model.joblib")

# Combine them into a single pipeline.
# Here, the pipeline will first apply the preprocessor (e.g., ColumnTransformer)
# and then run the model (e.g., RandomForest) on the processed data.
pipeline = Pipeline([
    ('preprocessor', preproc),
    ('model', model)
])

# Save the combined pipeline as a single file.
joblib.dump(pipeline, "pipeline.joblib")
print("✅ Combined pipeline saved as pipeline.joblib")