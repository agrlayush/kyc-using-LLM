import cv2
import os
import time

def create_output_folder(base_path="captured_frames"):
    """
    Create a new folder to store captured frames. 
    If folder exists, appends a unique number to create a new folder.
    """
    folder_number = 1
    folder_path = f"{base_path}/{folder_number}"
    
    while os.path.exists(folder_path):
        folder_number += 1
        folder_path = f"{base_path}/{folder_number}"
    
    os.makedirs(folder_path)
    print(f"Step 1: Created folder {folder_path} to store frames.")
    return folder_path

def capture_frames_from_camera(folder_path, num_frames=25, interval_ms=300):
    """
    Capture `num_frames` frames from the system camera every `interval_ms` milliseconds
    and save them to the specified folder.
    """
    # Step 2: Open the camera using OpenCV
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Unable to open the camera.")
        return
    
    print("Step 2: Camera initialized successfully.")
    time.sleep(1)
    # Step 3: Capture and save frames
    for i in range(1, num_frames + 1):
        ret, frame = cap.read()
        
        if not ret:
            print(f"Error: Unable to capture frame {i}.")
            break
        
        # Create a file name and save the frame
        filename = os.path.join(folder_path, f"frame_{i:02}.jpg")
        cv2.imwrite(filename, frame)
        print(f"Step 3: Captured and saved {filename}.")
        
        # Wait for the specified interval before capturing the next frame
        time.sleep(interval_ms / 1000.0)  
    # Step 4: Release the camera and close any OpenCV windows
    cap.release()
    cv2.destroyAllWindows()
    print("Step 4: Camera released and all windows closed.")

def capture_user_images():
    folder_path = create_output_folder()
    capture_frames_from_camera(folder_path, num_frames=10, interval_ms=500)
    
capture_user_images()
