import os
import time
import random
import string
import json
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from liveness_check_script import perform_liveness_check  # Import the liveness check function

app = Flask(__name__)

# Folder to store the captured frames
UPLOAD_FOLDER = 'captured_frames'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    # Create a unique folder (timestamp or random string) to store each test
    folder_name = generate_unique_folder_name()
    folder_path = os.path.join(UPLOAD_FOLDER, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    task = request.form.get('task')
    if not request.files:
        return jsonify({"error": "No files uploaded"}), 400

    # Get the list of uploaded files
    files = request.files.to_dict()  # Convert to dictionary to access using keys
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    # Save each file in the unique folder
    for key, file in files.items():
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(folder_path, filename))
    print("check liveness", task)
    # Call the liveness check function
    # try:
    liveness_result = json.loads(perform_liveness_check(folder_path, task))
    print(liveness_result)
    # except Exception as e:
    # return jsonify({"error": str(e)}), 500
    print(liveness_result['liveness_check'])
    # Return the result of the liveness check
    return jsonify({
        "liveness_check": liveness_result['liveness_check'],
        "confidence": liveness_result['confidence'],
        "reason": liveness_result['explanation']
    }), 200

def generate_unique_folder_name():
    """Generate a unique folder name using current timestamp or random string."""
    timestamp = str(int(time.time()))
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{timestamp}_{random_str}"

if __name__ == '__main__':
    print("Flask server is starting...")
    app.run(host='0.0.0.0', port=5001)
    # app.run(debug=True, port=5001)
