let selected_task = "None";
window.onload = async function() {
    try {
        await loadModels();  // Load models from the CDN
        console.log("Models loaded successfully.");
        detectFace();        // Start face detection after loading models
        selected_task = getRandomItem(tasks); 
        taskItem.innerHTML = selected_task.text
    } catch (error) {
        console.error("Error loading models or detecting faces:", error);
    }
    
}
async function loadModels() {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}
// new
async function detectFace() {
    console.log("detecting face")
    // const detections = await faceapi.detectAllFaces(videoFeed, new faceapi.TinyFaceDetectorOptions());

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    // Periodically check for face detection in the video feed
    const interval = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(videoFeed, options);
        // console.log(detections);

        if (detections.length > 0) {
            // const detection = detections[0]; // We only care about the first face detected

            // // Extract the bounding box and calculate center of the face
            // const { box } = detection;
            // const faceCenterX = box.x + box.width / 2;
            // const faceCenterY = box.y + box.height / 2;

            // // Get guide circle position and size
            // const guideCircleRect = guideCircle.getBoundingClientRect();
            // const guideCircleCenterX = guideCircleRect.x + guideCircleRect.width / 2;
            // const guideCircleCenterY = guideCircleRect.y + guideCircleRect.height / 2;
            // const guideCircleRadius = guideCircleRect.width / 2;

            // // Calculate the distance between the face center and the circle center
            // const distance = Math.sqrt(
            //     Math.pow(faceCenterX - guideCircleCenterX, 2) + Math.pow(faceCenterY - guideCircleCenterY, 2)
            // );

            // // Check if face is within the guiding circle
            // if (distance < guideCircleRadius && box.width < guideCircleRadius * 2 && box.height < guideCircleRadius * 2) {
            //     guideCircle.style.borderColor = 'green'; // Change the circle color to green
            //     captureBtn.style.display = 'block'; // Enable capture button
            //     captureBtn.disabled = false;
            //     clearInterval(interval); // Stop checking for face detection
            // } else {
            //     guideCircle.style.borderColor = 'red'; // Keep the circle red if not aligned
            //     captureBtn.disabled = true;
            // }



            console.log("detecting length > 0")
            const face = detections[0].box; // Get the first detected face

            const overlayWidth = overlay.clientWidth;
            const overlayHeight = overlay.clientHeight;
            const circleRadius = overlayWidth / 2;

            const faceWidth = face.width;
            const faceHeight = face.height;

            // Calculate the percentage of the circle covered by the face
            const faceArea = faceWidth * faceHeight;
            const circleArea = Math.PI * Math.pow(circleRadius, 2);
            const faceCoverage = faceArea / circleArea;

            // Determine if the face is too far or too close
            if (faceCoverage < 0.5) {
                console.log("detecting face coverage < 0.5")
                // Face is too small (too far)
                instructionText.style.display = 'block';
                instructionText.innerText = 'Move closer to the camera';
                overlay.classList.add('circle-red');
                overlay.classList.remove('circle-green');
                // captureBtn.disabled = true;
            } else if (faceCoverage > 0.5 && faceCoverage <= 1) {
                console.log("detecting face coverage between 0.8 to 1")
                // Face is well placed (80% covered)
                instructionText.style.display = 'none'; // Hide the instruction text
                overlay.classList.add('circle-green'); // Turn the circle green
                overlay.classList.remove('circle-red');
                captureBtn.disabled = false;
                clearInterval(interval);
                captureBtn.style.display = 'block';
            } else if (faceCoverage > 1) {
                console.log("detecting face coverage > 1")
                // Face is too large (too close)
                instructionText.style.display = 'block';
                instructionText.innerText = 'Move away from the camera';
                overlay.classList.add('circle-red');
                overlay.classList.remove('circle-green');
                // captureBtn.disabled = true;
            }
        } else {
            // No face detected
            console.log("No face")
            instructionText.style.display = 'block';
            instructionText.innerText = 'No face detected. Adjust your position.';
            overlay.classList.add('circle-red');
            overlay.classList.remove('circle-green');
            // captureBtn.disabled = true;
        }}, 1000)
}



// async function detectFace() {
//     const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

//     // Periodically check for face detection in the video feed
//     const interval = setInterval(async () => {
//         const detections = await faceapi.detectAllFaces(videoFeed, options);

//         if (detections.length > 0) {
//             const detection = detections[0]; // We only care about the first face detected

//             // Extract the bounding box and calculate center of the face
//             const { box } = detection;
//             const faceCenterX = box.x + box.width / 2;
//             const faceCenterY = box.y + box.height / 2;

//             // Get guide circle position and size
//             const guideCircleRect = guideCircle.getBoundingClientRect();
//             const guideCircleCenterX = guideCircleRect.x + guideCircleRect.width / 2;
//             const guideCircleCenterY = guideCircleRect.y + guideCircleRect.height / 2;
//             const guideCircleRadius = guideCircleRect.width / 2;

//             // Calculate the distance between the face center and the circle center
//             const distance = Math.sqrt(
//                 Math.pow(faceCenterX - guideCircleCenterX, 2) + Math.pow(faceCenterY - guideCircleCenterY, 2)
//             );

//             // Check if face is within the guiding circle
//             if (distance < guideCircleRadius && box.width < guideCircleRadius * 2 && box.height < guideCircleRadius * 2) {
//                 guideCircle.style.borderColor = 'green'; // Change the circle color to green
//                 captureBtn.style.display = 'block'; // Enable capture button
//                 captureBtn.disabled = false;
//                 clearInterval(interval); // Stop checking for face detection
//             } else {
//                 guideCircle.style.borderColor = 'red'; // Keep the circle red if not aligned
//                 captureBtn.disabled = true;
//             }
//             } else {
//             guideCircle.style.borderColor = 'red'; // No face detected, keep circle red
//             captureBtn.disabled = true;
//             }
//         }, 500); // Check every 500ms
//     }


let stream = null;
let faceDetected = false;

const tasks = [
    "See Left",
    "See Right",
    "See Up",
    "Rotate head in any direction",
    "See Left and then See Right",
    "See Right and then See Left"
]

async function startVerification(){
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoFeed.srcObject = stream;
        videoContainer.style.display = 'block';
        startVerificationBtn.style.display = 'none';
        // detectFace();
        } catch (error) {
        alert('Camera access denied');
        }
}

async function capture(){
    // Disable button and show loader
    captureBtn.disabled = true;
    captureBtn.innerHTML = '<span class="loader"></span> Capturing...';

    let captureCount = 0;
    const images = [];

    const captureInterval = setInterval(() => {
    if (captureCount < 10) {
        // Capture the current video frame as an image
        const canvas = document.createElement('canvas');
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        images.push(canvas.toDataURL('image/jpeg'));
        captureCount++;
    } else {
        clearInterval(captureInterval);
        captureBtn.innerHTML = '<span class="loader"></span> Capture complete, sending to server for liveness check';
        sendImagesForLiveness(images);
    }
    }, 500); // 500ms gap between each capture
}

// Send Images to API for Liveness Check
async function sendImagesForLiveness(images) {
    const formData = new FormData();
    formData.append('task', selected_task.text);
    images.forEach((image, index) => {
        const byteString = atob(image.split(',')[1]); 
        const mimeString = image.split(',')[0].split(':')[1].split(';')[0]; 
        const ab = new Uint8Array(byteString.length);
        
        for (let i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        formData.append(`file${index}`, blob, `image${index}.jpg`);
    });
    try {
        const response = await fetch('http://127.0.0.1:5001/upload', {
            method: 'POST',
            body: formData
        });
        captureBtn.innerHTML = '<span class="loader"></span> Request Sent to server, Waiting for response.';
        const result = await response.json();
        displayResult(result);
    } catch (error) {
        alert('Error sending images to server.');
        captureBtn.disabled = false;
        captureBtn.innerHTML = 'Retry Capture';
    } finally {
        captureBtn.disabled = false;
        captureBtn.innerHTML = 'Start Capture';
    }
}

// Display Result
function displayResult(result) {
    videoContainer.style.display = 'none';
    livenessResult.innerText = `Liveness Check: ${result.liveness_check}`;
    confidencenResult.innerText = `Explanation: ${result.confidence}`;
    reasonResult.innerText = `Explanation: ${result.reason}`;
    resultContainer.style.display = 'block';
}
async function restart(){
    resultContainer.style.display = 'none';
    startVerificationBtn.style.display = 'block';
    captureBtn.style.display = 'none';
    guideCircle.style.borderColor = 'red';
    faceDetected = false;
}

function getRandomItem(array) {
    if (array.length === 0) {
        return { index: -1, text: "Array is empty" };
    }
    const randomIndex = Math.floor(Math.random() * array.length);
    const randomItem = array[randomIndex];
    return { index: randomIndex, text: randomItem };
}
