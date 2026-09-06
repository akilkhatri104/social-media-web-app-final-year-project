import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)


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

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.25,
    random_state=42,
    stratify=y_encoded,
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(
        max_depth=4,
        random_state=42,
    ),
}

comparison = []

for name, model in models.items():

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )
    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )
    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )

    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    print(f"Accuracy : {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall   : {recall:.3f}")
    print(f"F1 Score : {f1:.3f}")

    print("\nPer-class performance:")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=encoder.classes_,
            zero_division=0,
        )
    )

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, predictions))

    comparison.append({
        "Model": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1,
    })


comparison_df = pd.DataFrame(comparison)

comparison_df.to_csv(
    "model_comparison.csv",
    index=False,
)

print("\n" + "=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

print(comparison_df.to_string(index=False))

print("\nSaved: model_comparison.csv")