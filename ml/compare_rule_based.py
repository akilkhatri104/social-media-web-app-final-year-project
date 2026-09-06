import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

df = pd.read_csv("auth-risk-dataset.csv")


def rule_based_risk(row):
    score = 0

    if row["failedAttempts"] >= 3:
        score += 4
    elif row["failedAttempts"] >= 1:
        score += 2

    if row["newDevice"]:
        score += 2

    if row["newIp"]:
        score += 2

    if row["unusualLoginTime"]:
        score += 1

    if score >= 6:
        return "HIGH"
    elif score >= 3:
        return "MEDIUM"
    else:
        return "LOW"


df["rulePrediction"] = df.apply(rule_based_risk, axis=1)

y_true = df["riskLevel"]
y_pred = df["rulePrediction"]

print("\nRULE-BASED RISK ENGINE")
print("=======================")

print(f"Accuracy : {accuracy_score(y_true, y_pred):.3f}")
print(
    f"Precision: "
    f"{precision_score(y_true, y_pred, average='weighted', zero_division=0):.3f}"
)
print(
    f"Recall   : "
    f"{recall_score(y_true, y_pred, average='weighted', zero_division=0):.3f}"
)
print(
    f"F1 Score : "
    f"{f1_score(y_true, y_pred, average='weighted', zero_division=0):.3f}"
)

print("\nPredicted vs Actual:")
print(
    pd.crosstab(
        df["riskLevel"],
        df["rulePrediction"],
        rownames=["Actual"],
        colnames=["Predicted"],
    )
)