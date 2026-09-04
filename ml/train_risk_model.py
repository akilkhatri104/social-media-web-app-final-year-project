import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


df = pd.read_csv("auth-risk-dataset.csv")

features = [
    "failedAttempts",
    "newIp",
    "newDevice",
    "unusualLoginTime",
]

X = df[features]
y = df["riskLevel"]

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

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

for name, model in models.items():
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print(f"\n{name}")
    print("-" * len(name))
    print(f"Accuracy : {accuracy_score(y_test, predictions):.3f}")
    print(
        f"Precision: "
        f"{precision_score(y_test, predictions, average='weighted', zero_division=0):.3f}"
    )
    print(
        f"Recall   : "
        f"{recall_score(y_test, predictions, average='weighted', zero_division=0):.3f}"
    )
    print(
        f"F1 Score : "
        f"{f1_score(y_test, predictions, average='weighted', zero_division=0):.3f}"
    )

print("\nRisk classes:", list(label_encoder.classes_))