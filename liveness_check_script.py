import os
from PIL import Image
import boto3
import io
import os
import json
import base64
import shutil

def load_images_from_folder(folder_path):
    images = []
    for filename in sorted(os.listdir(folder_path)):
        if filename.endswith('.jpg') or filename.endswith('.png'):
            image_path = os.path.join(folder_path, filename)
            try:
                img = Image.open(image_path)
                images.append(img)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
    return images

def prepare_image_base64(images):
    image_base64_list = []
    for img in images:
        with io.BytesIO() as output:
            img.save(output, format="JPEG")
            image_bytes = output.getvalue()
            # Convert bytes to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            image_base64_list.append(image_base64)
    return image_base64_list

def check_liveness_with_claude(image_bytes_list, task):
    """
    Send the image frames to Claude 3.5 Sonnet for liveness detection.
    """
    bedrock_client = boto3.client('bedrock-runtime')    
    prompt = f"""
    You are an expert human verification agent that identifies actual human infront of camera vs impersonating fraudsters using images or videos"
    You are a part of user onboarding process where user verification is very important to avoid fraud by impersonation.
    You are provided with a series of images taken using users' device camera with 500ms delay between each capture.
    We need to ensure that actual person is infront of the camera.
    We need to identify if there is a recorded video or a still image is held infront of the camera, thring to impersonate the actual user.
    The user was asked to do the following task during the capture: {task}

    You can look at following markers while validating the images
    1. phone held by someone showing the a picture or video infront of the device camera
    2. reflection visible on the image/video likely becuase of use of phone/image
    3. Bluryness on the uploaded image
    4. There is no movement in the uploaded images in users face, eyes, or any visible part.
    5. There are more than 1 person in the images.
    6. Any other parameter that can come as a part of in personation 
    7. Analyzing the video for any potential signs of editing, splicing, or looping.
    8. Checking for reflections or shadows that could indicate the use of a secondary device or display.
    9. Employ advanced computer vision techniques like depth mapping or infrared imaging to detect potential spoofing attempts using printed photos, videos on a flat display, or 3D masks.
    10. Check if user have complete the task asked during verification. If the task completion fails, the verification fails. If task completion passes, others checks are important
    Explain what contributed to your decision. Think step by step. 
    Respond only in the following json format.
    {{
        "number of input images":
        "liveness_check": "Pass" or "Fail",
        "confidence": "a number between 0 to 1, 1 being 100% confident",
        "task_completed": "true or false"
        "explanation":
    }}
    skip the preamble.
    """
    # print(prompt)
    content = []
    for img in image_bytes_list:
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": img
            }
        })
    content.append({
        "type": "text",
        "text": prompt
    })
    payload = {
        "messages": [
            {
                "role": "user",
                "content": content  # Here, we add the combined image and text content
            }
        ],
        "max_tokens": 1000,
        "anthropic_version": "bedrock-2023-05-31"
    }
    bedrock_response = bedrock_client.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps(payload)
        )
    result = json.loads(bedrock_response['body'].read().decode())
    # print(result)
    output = result["content"][0]["text"]
    return output

def perform_liveness_check(folder_path, task):
    # Load images from folder
    images = load_images_from_folder(folder_path)
    if len(images) < 5:
        raise ValueError("The folder must contain at least 5 images.")
    
    image_bytes_list = prepare_image_base64(images)
    result = check_liveness_with_claude(image_bytes_list, task)
    delete_folder_and_contents(folder_path)
    print(result)
    return result

def delete_folder_and_contents(folder_path):
    """
    Delete all contents inside the folder and the folder itself.
    
    :param folder_path: The path to the folder that needs to be deleted
    """
    try:
        # Check if the folder exists
        if os.path.exists(folder_path):
            # Delete the folder and all its contents
            shutil.rmtree(folder_path)
            print(f"Folder '{folder_path}' and its contents have been deleted.")
        else:
            print(f"Folder '{folder_path}' does not exist.")
    except Exception as e:
        print(f"Error occurred while deleting the folder: {str(e)}")

# Example Usage
# folder_path = "captured_frames/1729757656_jyyk6g"
# task = "look left, look right"
# result = perform_liveness_check(folder_path, task)
# print("Liveness Result:", result)
