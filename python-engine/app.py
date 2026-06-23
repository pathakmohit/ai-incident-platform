from flask import Flask, request, jsonify
from classifier import classify_logs

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "python-ai-engine"})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)
    if not data or "logs" not in data:
        return jsonify({"error": "logs field required"}), 400

    result = classify_logs(data["logs"])
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
