# Multimodal KYC Liveness Verification using LLMs

## Problem Statement
In the KYC (Know Your Customer) process, it's crucial to ensure that the individual submitting identification documents is indeed present and alive. The challenge is to perform this verification remotely while minimizing fraud by validating that the user’s face is live and active, not just a static image or video replay.

## Solution
This project uses multimodal capabilities of Large Language Models (LLMs) and AI-powered facial detection to validate if a series of images captured from a user's webcam demonstrates the required movements, such as "look left, look right," confirming the user’s liveness. A Flask backend facilitates image upload and processing, while the front-end uses `face-api.js` to guide the user and capture images. This ensures secure and accurate identity verification.

## Architecture Diagram
<!-- 
![Architecture Diagram](link-to-diagram) -->

The architecture consists of:
1. **Frontend (HTML + JS)**: Captures 10 frames of the user's face at intervals and sends them for validation.
2. **Backend (Flask)**: Receives the images, stores them in unique folders, and invokes an LLM-based liveness check function.
3. **LLM Model(Claude 3 Sonnet)**: Processes the series of images and evaluates if the user’s movements match the required actions.

## Libraries Used
- **face-api.js**: For real-time face detection in the browser.
- **Flask**: To handle file uploads and backend logic.
- **boto3**: AWS SDK for Python, for interacting with AWS services.
- **LLMs**: To process the images and determine liveness.

## Step-by-Step Implementation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install the Required Libraries
```bash
pip install -r requirements.txt
```

### 3. Configure AWS Credentials
Set up AWS credentials in your environment to allow the Flask app to interact with AWS services (if applicable). This is required for any AWS services like storing images, using AI models, etc.
```bash
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

### 4. Start the Flask Server
```bash
python3 server.py
```

### 5. Open the Application in a Browser
Navigate to `127.0.0.1:5001` in your browser to start the liveness check process.

### 6. Clear the Captured Frames Folder Regularly
As the app captures multiple images during the liveness check, periodically clear the `captured_frames/` folder to avoid storage bloat.
```bash
rm -rf captured_frames/*
```

## How Can This Be Used in Production?
To use this in a production environment:
1. **Hosting**: Deploy the Flask backend to cloud services like AWS for scalability.
2. **Security**: Secure the application using HTTPS and authentication mechanisms to ensure the security of sensitive user data.
3. **Enhancements**: Incorporate further user movement requirements, enhance face matching, and integrate with authentication services such as AWS Cognito for robust identity verification.
4. **Scaling**: Use AWS Lambda or Fargate to handle large-scale image processing if needed.

### Todo
1. Add functionality to allow user to upload their identity cards
2. Do a facematch of the live user with the uploaded identity card
3. Process the audio from the user's device and check for markers that can reflect fraudaulant attempts.
4. Add dynamic Actions generted by the LLMs.