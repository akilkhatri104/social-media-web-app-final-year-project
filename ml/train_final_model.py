import json
import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("auth-risk-dataset.csv")

features = [
    "failedAttempts",
    "newIp",
    "newDevice",
    "unusualLoginTime",
]

X = df[features]
y = df["riskLevel"]

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

model = LogisticRegression(max_iter=1000)
model.fit(X, y_encoded)

model_data = {
    "features": features,
    "classes": encoder.classes_.tolist(),
    "coefficients": model.coef_.tolist(),
    "intercepts": model.intercept_.tolist(),
}

os.makedirs("ml/model", exist_ok=True)

with open("ml/model/risk_model.json", "w") as f:
    json.dump(model_data, f, indent=2)

print("Final Logistic Regression model trained.")
print("Classes:", encoder.classes_.tolist())
print("Saved: ml/model/risk_model.json")