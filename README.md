# 🏭 Predictive Maintenance System using IoT, AI & Cloud

![Python](https://img.shields.io/badge/python-3.9%2B-brightgreen.svg)
![React](https://img.shields.io/badge/react-18%2B-blue.svg)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?logo=amazon-aws&logoColor=white)

An end-to-end industrial solution that monitors machine health in real-time, predicts potential failures using Machine Learning, and visualizes data through a cloud-integrated dashboard.

---

## 📌 Project Overview
This project implements a predictive maintenance pipeline for industrial machinery. By leveraging **IoT sensors**, **AWS Cloud services**, and **Random Forest ML models**, the system identifies patterns of wear and tear before they lead to costly downtime.

### Key Goals:
* **Reduce unplanned downtime** by predicting failures before they occur.
* **Optimize maintenance schedules** based on actual machine health.
* **Provide real-time visibility** into machine telemetry for plant managers.

---

## 🧠 System Architecture
The data flows through the following pipeline:

1.  **Edge:** IoT Sensors (Temperature, Pressure, Vibration) collect raw telemetry.
2.  **Ingestion:** **ESP8266** transmits data via **MQTT** to **AWS IoT Core**.
3.  **Processing:** **AWS Lambda** validates and formats the incoming JSON data.
4.  **Storage:** Data is stored in **AWS DynamoDB** (NoSQL) for high scalability.
5.  **Intelligence:** A **Flask Backend** loads a **Random Forest** model to run real-time predictions.
6.  **Visualization:** A **React Dashboard** displays live charts and machine health alerts.

---

## 📁 Project Folder Structure
```text
predictive-maintenance-system/
│
├── iot/                # ESP8266 Arduino sketches & wiring diagrams
│   ├── esp8266_code/
│   │   └── esp8266_aws_iot.ino
│   └── sensors/
├── backend/            # Flask API & ML Model serving
│   ├── app.py
│   ├── model/          # Trained .joblib files
│   │   └── rf_model.joblib
│   └── requirements.txt
├── ml/                 # Model training notebooks & datasets
│   ├── notebooks/
│   │   └── model_training.ipynb
│   └── data/
│       └── train.csv
├── frontend/           # React.js dashboard source code
│   ├── src/
│   ├── public/
│   └── package.json
├── aws/                # Lambda functions & Cloud configurations
│   └── lambda_function.py
└── README.md
```
---
##🔧 Tech Stack
1.Hardware: ESP8266 (NodeMCU), DHT22 (Temp), BMP280 (Pressure), MPU6050 (Vibration).
2. Cloud (AWS): IoT Core, Lambda, DynamoDB.
3. Machine Learning: Python, Scikit-Learn, Random Forest, Pandas.
4. Web: React.js (Frontend), Flask (Backend), Tailwind CSS.

---
##☁️ Cloud Services Used

1. AWS IoT Core
   Secure MQTT communication between ESP8266 and AWS
   Device authentication using certificates
2. AWS Lambda
  Receives sensor data from IoT Core
  Performs basic validation and formatting
3. AWS DynamoDB
   NoSQL database to store real-time sensor readings
   Scalable and cost-efficient for IoT workloads
---

##🤖 Machine Learning Pipeline

We use a Random Forest Classifier because of its robustness against noisy sensor data and its ability to provide Feature Importance (e.g., which sensor triggered the alert).
Training: Processed historical sensor logs with labeled failure events.
Metrics: Evaluated using Accuracy, Precision, Recall, and Confusion Matrix.
Deployment: Model is serialized via joblib for low-latency inference in the Flask API.


##🚀 Getting Started

1. Backend Setup
Bash

cd backend
pip install -r requirements.txt
python app.py

2. Frontend Setup
Bash

cd frontend
npm install
npm start

3. IoT Setup
Flash the .ino code located in iot/esp8266_code/ to your NodeMCU.
Ensure your AWS certificates (certificate.pem.crt, private.pem.key) are placed in the appropriate directory.

---
##📊 Dashboard Features
Real-time Telemetry: Live streaming of Temperature, Vibration, and Pressure.

Health Indicator: Green (Stable), Yellow (Warning), Red (Maintenance Required).

Historical Trends: View sensor data logs over time to identify patterns.

##🎯 Future Enhancements
[ ] RUL Prediction: Implement Remaining Useful Life (RUL) estimation.

[ ] Notifications: Integrate Twilio for SMS alerts or AWS SNS for email.

[ ] Multi-Machine: Support for monitoring a fleet of different machines.

##👨‍💻 Authors
Final Year Engineering Project Team
1. Adithya L -- github:https://github.com/adithyaLaxmiprasad
2. Dasari Ushodaya -- github:https://github.com/Ushodaya07
3. G Hruthik Reddy ---
4. J V Akash ----
-----
Developed for Educational Purposes.
