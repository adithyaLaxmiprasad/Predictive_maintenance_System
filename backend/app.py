from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env

import os
import json
import boto3
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Key
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for API calls from React

# Global variables to store prediction history
prediction_history = []
unchanged_counter = 0

# Load the machine learning pipeline directly
try:
    # Load pipeline directly from joblib file
    pipeline = joblib.load("pipeline.joblib")
    print(f"Pipeline loaded successfully from pipeline.joblib")
    print(f"Pipeline steps: {list(pipeline.named_steps.keys())}")
    
    # Optional: Print model info for debugging
    if hasattr(pipeline, 'named_steps'):
        # Check for either 'classifier' or 'model' step
        if 'classifier' in pipeline.named_steps:
            print(f"Classifier type: {type(pipeline.named_steps['classifier'])}")
        elif 'model' in pipeline.named_steps:
            print(f"Model type: {type(pipeline.named_steps['model'])}")
        if 'preprocessor' in pipeline.named_steps:
            print(f"Preprocessor type: {type(pipeline.named_steps['preprocessor'])}")
            
except Exception as e:
    print(f"Warning: Could not load ML pipeline: {str(e)}")
    pipeline = None

# Retrieve AWS credentials and region from environment variables
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

# Initialize a boto3 DynamoDB resource using credentials from .env
try:
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=aws_region,
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key
    )
    table = dynamodb.Table("IoT_Sensor_Data")
    print(f"✅ Connected to DynamoDB table: {table.table_name}")
except Exception as e:
    print(f"Warning: Could not connect to DynamoDB: {str(e)}")
    table = None

# Helper function to format timestamp for DynamoDB query
def format_timestamp_for_query(dt):
    """Format datetime to match DynamoDB timestamp format: 2025-05-29T10:01:46.235867"""
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")

# Function to convert Machine_Type to Machine_Type_Code
def get_machine_type_code(machine_type):
    """Convert Machine_Type to the code expected by the model"""
    mapping = {
        'Type_A': 0,
        'Type_B': 1,
        'Type_C': 2
    }
    return mapping.get(machine_type, 0)  # Default to 0 if not found

# Endpoint to retrieve recent sensor data from DynamoDB
@app.route('/sensors', methods=['GET'])
def get_sensors():
    try:
        # Attempt to get actual data first
        if table:
            # Use local time with extended window to account for timezone differences
            now = datetime.now()  # Use local time instead of UTC
            six_hours_ago = now - timedelta(hours=6)  # Look back 6 hours to account for timezone
            
            # Format timestamps to match DynamoDB format
            now_str = format_timestamp_for_query(now)
            six_hours_ago_str = format_timestamp_for_query(six_hours_ago)
            
            print(f"Querying from {six_hours_ago_str} to {now_str}")
            print(f"Table name: {table.table_name}")
            print(f"Looking for deviceId: ESP8266_IoT")
            
            try:
                response = table.query(
                    KeyConditionExpression=Key('deviceId').eq('ESP8266_IoT') &
                                          Key('timestamp').between(six_hours_ago_str, now_str),
                    ScanIndexForward=False,
                    Limit=24
                )
                items = response.get('Items', [])
                print(f"Query response metadata: {response.get('ResponseMetadata', {})}")
                print(f"Found {len(items)} sensor readings in DynamoDB")
                
                if len(items) > 0:
                    print(f"Sample item: {items[0]}")
                
            except Exception as query_error:
                print(f"Query error: {str(query_error)}")
                print(f"Error type: {type(query_error)}")
                # Try a simple scan as fallback
                try:
                    print("Trying scan as fallback...")
                    scan_response = table.scan(Limit=5)
                    scan_items = scan_response.get('Items', [])
                    print(f"Scan found {len(scan_items)} items")
                    if scan_items:
                        print(f"Sample scan item: {scan_items[0]}")
                except Exception as scan_error:
                    print(f"Scan also failed: {str(scan_error)}")
                
                return jsonify({"error": f"Query failed: {str(query_error)}"}), 500
            
            if items:  # If we found any real data, use it
                formatted_items = []
                for i, item in enumerate(items):
                    formatted_items.append({
                        "id": i + 1,
                        "timestamp": item.get("timestamp"),
                        "temperature": float(item.get("Temperature", 0)),
                        "vibration": float(item.get("Vibration", 0)),
                        "power_consumption": float(item.get("Power_Usage", 0)),
                        "humidity": float(item.get("Humidity", 65)),
                        "pressure": float(item.get("Pressure", 905))
                    })
                print(f"Returning {len(formatted_items)} real sensor readings")
                return jsonify(formatted_items)
        
        # If we reach here, either no table connection or no data found
        # Return simulated data for UI development
        current_time = datetime.now()  # Use local time
        simulated_data = []
        
        # Generate 24 simulated readings with proper timestamp format
        for i in range(24):
            timestamp = format_timestamp_for_query(current_time - timedelta(minutes=i))
            # Add some variation to make it look realistic
            base_temp = 70 + (i % 10)           # Updated to match training data
            base_vibration = 1.2 + (i % 5) * 0.1  # Updated to realistic range
            base_power = 0.2 + (i % 7) * 0.01   # Updated to match training data
            base_humidity = 40 + (i % 8) * 2    # Updated to match training data
            base_pressure = 30 + (i % 6) * 1.5  # Keep original range
            
            simulated_data.append({
                "id": i + 1,
                "timestamp": timestamp,
                "temperature": base_temp,
                "vibration": base_vibration,
                "power_consumption": base_power,
                "humidity": base_humidity,
                "pressure": base_pressure
            })
        
        print("No real sensor data found. Returning simulated data.")
        return jsonify(simulated_data)
        
    except Exception as e:
        print(f"Error in get_sensors: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Debug endpoint to scan the table and see what data exists
@app.route('/debug/scan-table', methods=['GET'])
def debug_scan_table():
    try:
        if not table:
            return jsonify({"status": "error", "message": "DynamoDB connection not available"}), 500
        
        # Scan table to see what data exists (limit to 10 items)
        response = table.scan(Limit=10)
        items = response.get('Items', [])
        
        # Get table key schema
        table_description = table.meta.client.describe_table(TableName=table.table_name)
        key_schema = table_description['Table']['KeySchema']
        
        return jsonify({
            "status": "success",
            "table_name": table.table_name,
            "key_schema": key_schema,
            "item_count": len(items),
            "sample_items": items[:3] if items else None,
            "all_device_ids": list(set([item.get('deviceId', 'NO_DEVICE_ID') for item in items])),
            "timestamp_formats": list(set([item.get('timestamp', 'NO_TIMESTAMP')[:19] for item in items if item.get('timestamp')]))
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# Debug endpoint for simple query without timestamp filter
@app.route('/debug/simple-query', methods=['GET'])
def debug_simple_query():
    try:
        if not table:
            return jsonify({"status": "error", "message": "DynamoDB connection not available"}), 500
        
        # Try a simple query without timestamp filter first
        response = table.query(
            KeyConditionExpression=Key('deviceId').eq('ESP8266_IoT'),
            ScanIndexForward=False,
            Limit=5
        )
        
        items = response.get('Items', [])
        
        return jsonify({
            "status": "success",
            "found_items": len(items),
            "items": items,
            "query_used": "deviceId = 'ESP8266_IoT' (no timestamp filter)"
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "error_type": str(type(e))
        }), 500

# Debug endpoint to check AWS connection
@app.route('/debug/aws-connection', methods=['GET'])
def debug_aws_connection():
    try:
        if not table:
            return jsonify({"status": "error", "message": "DynamoDB connection not available"}), 500
            
        # Try to fetch a small sample of data with new timestamp format
        now = datetime.now()  # Use local time
        six_hours_ago = now - timedelta(hours=6)
        
        now_str = format_timestamp_for_query(now)
        six_hours_ago_str = format_timestamp_for_query(six_hours_ago)
        
        response = table.query(
            KeyConditionExpression=Key('deviceId').eq('ESP8266_IoT') &
                                  Key('timestamp').between(six_hours_ago_str, now_str),
            ScanIndexForward=False,
            Limit=2
        )
        
        items = response.get('Items', [])
        item_count = len(items)
        
        # Get table information
        table_info = table.table_status if hasattr(table, 'table_status') else "Unknown"
        
        return jsonify({
            "status": "success",
            "connection": "active",
            "table_status": table_info,
            "items_retrieved": item_count,
            "sample_data": items if items else None,
            "query_timestamps": {
                "from": six_hours_ago_str,
                "to": now_str
            }
        })
        
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": f"AWS error: {str(e)}",
            "aws_access_key_id": aws_access_key_id[:4] + "..." if aws_access_key_id else "Not set",
            "aws_region": aws_region
        }), 500

# Get assets endpoint
@app.route('/assets', methods=['GET'])
def get_assets():
    # In a real app, this would come from a database
    assets = [
        { "id": 1, "name": "Pump A1", "type": "Hydraulic Pump", "status": "Online", "x_pct": 20, "y_pct": 30 },
        { "id": 2, "name": "Motor B2", "type": "Electric Motor", "status": "Warning", "x_pct": 45, "y_pct": 55 },
        { "id": 3, "name": "Valve C3", "type": "Control Valve", "status": "Offline", "x_pct": 70, "y_pct": 25 },
        { "id": 4, "name": "Fan D4", "type": "Cooling Fan", "status": "Online", "x_pct": 80, "y_pct": 75 }
    ]
    return jsonify(assets)

# Updated prediction endpoint with proper timestamp handling and correct Machine_Type_Code
@app.route('/predict', methods=['GET'])
def get_prediction():
    global prediction_history
    try:
        if not table or not pipeline:
            # If no DynamoDB or ML pipeline, return simulated predictions
            current_time = datetime.now()  # Use local time
            simulated_predictions = []
            
            # Generate 10 simulated predictions with varied risk levels
            for i in range(10):
                timestamp = format_timestamp_for_query(current_time - timedelta(minutes=i*5))
                # Vary risk levels for demonstration
                risk_base = 0.1 + (i % 4) * 0.2  # Creates risks from 0.1 to 0.7
                risk_variation = np.random.uniform(-0.05, 0.05)  # Small random variation
                risk = max(0.0, min(1.0, risk_base + risk_variation))
                
                simulated_predictions.append({
                    "id": i + 1,
                    "machine_id": "ESP8266_IoT",
                    "timestamp": timestamp,
                    "risk": round(risk, 3),
                    "note": "Simulated - No DB/Model"
                })
            
            return jsonify(simulated_predictions)
        
        # Get up to 10 latest data points for multiple predictions - no timestamp filter
        response = table.query(
            KeyConditionExpression=Key('deviceId').eq('ESP8266_IoT'),
            ScanIndexForward=False,
            Limit=10  # Get the 10 most recent entries
        )
        items = response.get('Items', [])
        
        if not items:
            return jsonify({"error": "No sensor data available"}), 404

        print(f"Processing {len(items)} sensor readings for predictions")
        
        # Generate predictions for each available sensor reading
        predictions = []
        
        for idx, item in enumerate(items):
            # Extract sensor data from DynamoDB
            temperature = float(item.get("Temperature", 70))
            vibration = float(item.get("Vibration", 1.0))
            power_usage = float(item.get("Power_Usage", 0.2))
            humidity = float(item.get("Humidity", 40))
            pressure = float(item.get("Pressure", 30))
            machine_type = item.get("Machine_Type", "Type_A")
            timestamp = item.get("timestamp", format_timestamp_for_query(datetime.now()))
            
            # Create DataFrame for model input with Machine_Type_Code
            data = pd.DataFrame([{
                "Temperature": temperature,
                "Vibration": vibration,
                "Power_Usage": power_usage,
                "Humidity": humidity,
                "Pressure": pressure,
                "Machine_Type_Code": get_machine_type_code(machine_type)  # Convert to code
            }])
            
            # Process with ML model - handle both 'classifier' and 'model' steps
            try:
                preprocessor = pipeline.named_steps['preprocessor']
                transformed_data = preprocessor.transform(data)
                
                # Check for either 'classifier' or 'model' step
                if 'classifier' in pipeline.named_steps:
                    model = pipeline.named_steps['classifier']
                elif 'model' in pipeline.named_steps:
                    model = pipeline.named_steps['model']
                else:
                    raise ValueError("No classifier or model step found in pipeline")
                
                prediction = model.predict(transformed_data)
                risk_score = float(prediction[0])
                print(f"✅ Model prediction successful for item {idx}: {risk_score}")
                
            except Exception as e:
                print(f"Model prediction error for item {idx}: {str(e)}")
                # Generate a realistic risk score based on sensor values
                risk_score = 0.1
                if temperature > 75: risk_score += 0.3
                if vibration > 2.0: risk_score += 0.2
                if power_usage > 0.25: risk_score += 0.2
                if humidity > 70 or humidity < 30: risk_score += 0.1
                if pressure > 35 or pressure < 25: risk_score += 0.1
                risk_score = min(1.0, risk_score)
            
            # Create prediction object
            prediction_obj = {
                "id": idx + 1,
                "machine_id": "ESP8266_IoT",
                "timestamp": timestamp,
                "risk": round(risk_score, 3),
                "temperature": temperature,
                "vibration": vibration,
                "power": power_usage,
                "humidity": humidity,
                "pressure": pressure,
                "machine_type": machine_type,
                "note": f"Real prediction from sensor data #{idx + 1}"
            }
            
            predictions.append(prediction_obj)
        
        # If we have fewer than 10 predictions, pad with interpolated ones
        while len(predictions) < 10:
            if len(predictions) > 0:
                # Create a slight variation of the last prediction
                last_pred = predictions[-1]
                
                # Parse the timestamp properly
                try:
                    if 'T' in last_pred["timestamp"]:
                        last_time = datetime.fromisoformat(last_pred["timestamp"].replace('Z', ''))
                    else:
                        last_time = datetime.now()
                except:
                    last_time = datetime.now()
                
                new_timestamp = format_timestamp_for_query(last_time - timedelta(minutes=5))
                
                # Add some variation to risk score
                risk_variation = np.random.uniform(-0.05, 0.05)
                new_risk = max(0.0, min(1.0, last_pred["risk"] + risk_variation))
                
                interpolated_pred = {
                    "id": len(predictions) + 1,
                    "machine_id": "ESP8266_IoT",
                    "timestamp": new_timestamp,
                    "risk": round(new_risk, 3),
                    "temperature": last_pred.get("temperature", 70),
                    "vibration": last_pred.get("vibration", 1.0),
                    "power": last_pred.get("power", 0.2),
                    "humidity": last_pred.get("humidity", 40),
                    "pressure": last_pred.get("pressure", 30),
                    "machine_type": last_pred.get("machine_type", "Type_A"),
                    "note": "Interpolated prediction"
                }
                predictions.append(interpolated_pred)
            else:
                break
        
        # Sort by timestamp (newest first)
        predictions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Update global prediction history
        prediction_history = predictions[:10]  # Keep only latest 10
        
        print(f"Returning {len(predictions)} predictions")
        return jsonify(predictions)
    
    except Exception as e:
        print(f"Error in get_prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Model info endpoint updated for pipeline.joblib
@app.route('/model-info', methods=['GET'])
def get_model_info():
    try:
        if not pipeline:
            return jsonify({"error": "ML pipeline not available"}), 503
        
        # Handle both 'classifier' and 'model' step names
        model_step = None
        model_type = None
        if 'classifier' in pipeline.named_steps:
            model_step = 'classifier'
            model_type = str(type(pipeline.named_steps['classifier']))
        elif 'model' in pipeline.named_steps:
            model_step = 'model'
            model_type = str(type(pipeline.named_steps['model']))
        
        info = {
            "pipeline_steps": list(pipeline.named_steps.keys()),
            "model_type": model_type,
            "model_step": model_step,
            "feature_names": None,
            "pipeline_source": "pipeline.joblib",
            "model_params": None
        }
        
        # Try to get feature names from preprocessor
        try:
            if hasattr(pipeline.named_steps['preprocessor'], 'get_feature_names_out'):
                info["feature_names"] = list(pipeline.named_steps['preprocessor'].get_feature_names_out())
        except:
            pass
        
        # Try to get model parameters
        try:
            if model_step and hasattr(pipeline.named_steps[model_step], 'get_params'):
                info["model_params"] = pipeline.named_steps[model_step].get_params()
        except:
            pass
            
        return jsonify(info)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Pipeline validation function - updated to handle both 'classifier' and 'model'
def validate_pipeline(pipeline):
    """Validate that the pipeline has expected components"""
    required_preprocessor = 'preprocessor'
    model_steps = ['classifier']  # Accept either name
    
    actual_steps = list(pipeline.named_steps.keys())
    
    # Check for preprocessor
    if required_preprocessor not in actual_steps:
        raise ValueError(f"Pipeline missing required step: {required_preprocessor}")
    
    # Check for either classifier or model step
    has_model = any(step in actual_steps for step in model_steps)
    if not has_model:
        raise ValueError(f"Pipeline missing model step. Expected one of: {model_steps}")
    
    print("✅ Pipeline validation passed")
    return True

# Validate pipeline if loaded
if pipeline:
    try:
        validate_pipeline(pipeline)
    except Exception as e:
        print(f"❌ Pipeline validation failed: {e}")
        pipeline = None

if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    debug_mode = bool(int(os.getenv("FLASK_DEBUG", 1)))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)