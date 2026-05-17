from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import joblib

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))

data = pd.read_csv(os.path.join(BASE_DIR, "Dataset.csv"))

@app.route("/")
def home():
    return "Spam Classifier Backend Running"

@app.route("/samples", methods=["GET"])
def get_samples():
    samples = data.get("Message", "").tolist()
    return jsonify({
        "samples": samples
    })

@app.route("/predict", methods=["POST"])
def predict():
    data_json = request.get_json()
    message = data_json.get("message", "")
    lower_msg = message.lower()
    spam_keywords = [
        "free",
        "win",
        "winner",
        "offer",
        "cash",
        "urgent",
        "claim",
        "click",
        "prize",
        "congratulations",
        "lottery",
        "gift",
        "money",
        "bonus",
        "limited time",
        "earn",
        "credit card",
        "loan",
        "buy now",
        "selected",
        "exclusive",
        "cheap",
        "discount",
        "subscribe",
        "risk free",
        "act now",
        "call now",
        "guaranteed"
    ]
    detected_words = []
    spam_score = 0

    for word in spam_keywords:
        if word in lower_msg:
            detected_words.append(word)
            spam_score += 1
    transformed_message = vectorizer.transform([message])
    prediction = model.predict(transformed_message)[0]
    
    try:
        probability = model.predict_proba(transformed_message)[0]
        confidence = round(max(probability) * 100, 2)
    except Exception:
        confidence = 95
    
    if spam_score >= 2:
        result = "SPAM"
        confidence = max(confidence, 96)
    else:
        result = "SPAM" if prediction == 1 else "GENUINE"
    risk = confidence if result == "SPAM" else max(5, 100 - confidence)
    
    return jsonify({
        "prediction": result,
        "confidence": confidence,
        "risk": risk,
        "spam_words": detected_words
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000))
    )