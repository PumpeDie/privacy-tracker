from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import datetime
import io
import json
import os

app = Flask(__name__)
# Autorise le client web à communiquer avec ce serveur et à envoyer des cookies
CORS(app, supports_credentials=True)

LOG_FILE = "logs.json"

def save_log(log_entry):
    """Enregistre l'événement dans un fichier local"""
    logs = []
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                pass
    logs.append(log_entry)
    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=4)

@app.route('/pixel.gif', methods=['GET'])
def tracking_pixel():
    """Simule un pixel de suivi transparent"""
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "event": "Chargement Pixel",
        "ip_address": request.remote_addr,
        "user_agent": request.headers.get('User-Agent'),
        "url_params": dict(request.args),
        "cookies": dict(request.cookies)
    }
    save_log(log_entry)
    
    # Génération d'un GIF transparent 1x1 en mémoire
    gif = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01D\x00;'
    return send_file(io.BytesIO(gif), mimetype='image/gif')

@app.route('/track', methods=['POST', 'OPTIONS'])
def track_action():
    """Enregistre les actions explicites (clics, ajout panier)"""
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    data = request.json or {}
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "event": data.get("action", "Action Inconnue"),
        "ip_address": request.remote_addr,
        "details": data,
        "cookies": dict(request.cookies)
    }
    save_log(log_entry)
    return jsonify({"status": "logged"}), 200

@app.route('/logs', methods=['GET'])
def get_logs():
    """Expose les logs pour l'interface utilisateur"""
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            try:
                return jsonify(json.load(f))
            except json.JSONDecodeError:
                return jsonify([])
    return jsonify([])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
