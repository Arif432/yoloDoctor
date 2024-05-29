import os
import pickle
from flask import Flask, render_template, request, send_from_directory, redirect, url_for
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance, ImageFilter
from ultralytics import YOLO
from scipy.ndimage import median_filter
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Define the upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
class_mapping = {
    0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 
    10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F', 16: 'G', 17: 'H', 18: 'I', 19: 'K', 
    20: 'L', 21: 'M', 22: 'N', 23: 'O', 24: 'P', 25: 'Q', 26: 'R', 27: 'S', 28: 'T', 29: 'U', 
    30: 'V', 31: 'X', 32: 'Y', 33: 'Z', 34: 'a', 35: 'b', 36: 'c', 37: 'd', 38: 'e', 39: 'f', 
    40: 'g', 41: 'h', 42: 'i', 43: 'j', 44: 'k', 45: 'l', 46: 'm', 47: 'n', 48: 'o', 49: 'p', 
    50: 'q', 51: 'r', 52: 's', 53: 't', 54: 'u', 55: 'v', 56: 'w', 57: 'x', 58: 'y', 59: 'z'
}

def get_latest_predict_folder():
    predict_folders = [f for f in os.listdir(os.path.join(os.getcwd(), "runs", "detect")) if f.startswith("predict")]
    if predict_folders:
        predict_folders.sort(key=lambda x: os.path.getmtime(os.path.join(os.getcwd(), "runs", "detect", x)), reverse=True)
        return os.path.join(os.getcwd(), "runs", "detect", predict_folders[0])
    else:
        return None

def save_detections_to_pickle(detections):
    pickle_filepath = os.path.join(os.getcwd(), "detections.pickle")
    with open(pickle_filepath, 'wb') as pickle_file:
        pickle.dump(detections, pickle_file)
    return pickle_filepath

def process_image(f):
    filepath = os.path.join(os.getcwd(), "uploads", secure_filename(f.filename))
    f.save(filepath)
    return filepath

def gaussian_blur(image):
    blurred_image = image.filter(ImageFilter.GaussianBlur(radius=2))
    return blurred_image

def grayscaling(image):
    grayscale_image = image.convert('L')
    return grayscale_image

def contrast_enhancement(image):
    enhancer = ImageEnhance.Contrast(image)
    enhanced_image = enhancer.enhance(1.5)  # Increase contrast by 50%
    return enhanced_image

def brightness_adjustment(image):
    enhancer = ImageEnhance.Brightness(image)
    enhanced_image = enhancer.enhance(1.2)  # Increase brightness by 20%
    return enhanced_image

def unblur_image(image):
    unblurred_image = image.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    return unblurred_image

def binarization(image):
    threshold_value = 128  # Adjust threshold value as needed
    binary_image = image.point(lambda p: 255 if p > threshold_value else 0)  # Convert to binary
    return binary_image

def predict_with_yolo(img_path):
    img = Image.open(img_path)
    yolo = YOLO("best.pt")
    detections = yolo.predict(img, save=True)
    return detections

import ast

def process_yolo_output(file_path):
    # Initialize a list to store the parsed data
    parsed_data = []

    # Read the file and parse the contents
    with open(file_path, 'r') as file:
        for line in file:
            print(f"Line from file: {line.strip()}")  # Debug statement
            if not line.strip():
                print("Skipping empty line")  # Debug statement
                continue
            parts = line.strip().split(maxsplit=2)
            if len(parts) < 3:
                print(f"Skipping invalid line: {line.strip()}")  # Debug statement
                continue
            try:
                class_name = int(parts[0])
                confidence = float(parts[1])
                coords = ast.literal_eval(parts[2])  # Safely parse the string representation of the list
            except (ValueError, SyntaxError) as e:
                print(f"Skipping invalid line due to error: {line.strip()}, {e}")  # Debug statement
                continue
            
            # Append a tuple of (class_name, confidence, coords) to the parsed_data list
            parsed_data.append((class_name, confidence, coords))

    if not parsed_data:
        print("No valid detections found")  # Debug statement
        return ""

    # Sort the parsed data based on the smallest x-coordinate (first element in coords)
    parsed_data.sort(key=lambda x: x[2][0])

    # Separate the sorted data into class names and coordinates
    class_names = [item[0] for item in parsed_data]
    coordinates = [item[2] for item in parsed_data]

    # Combine class names and coordinates into a single list
    sorted_parsed_data = [class_names, coordinates]

    # Extract class names from sorted_parsed_data
    class_names_sorted = sorted_parsed_data[0]

    # Initialize a list to store the concatenated result
    concatenated_result = ""

    # Concatenate the class names based on the mapping
    for class_name in class_names_sorted:
        concatenated_result += class_mapping[class_name]

    print(f"Concatenated result: {concatenated_result}")  # Debug statement
    return concatenated_result


@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/predict_img', methods=['POST'])
def predict_img():
    if request.method == 'POST':
        if 'file' in request.files:
            f = request.files['file']
            file_extension = f.filename.rsplit('.', 1)[1].lower()
            if file_extension == 'jpg':
                filepath = process_image(f)
                
                # Load the image and apply enhancements
                img = Image.open(filepath)
                img = unblur_image(img)
                img = contrast_enhancement(img)
                # img = brightness_adjustment(img)
                # img = gaussian_blur(img)
                # img = binarization(img)

                img.save(filepath)  # Overwrite the original image with the processed one
                
                detections = predict_with_yolo(filepath)
                txt_file_path = os.path.join(get_latest_predict_folder(), os.path.basename(filepath).replace('.jpg', '.txt'))
                
                # Debug statement to print detections
                print(f"Detections: {detections}")
                
                with open(txt_file_path, 'w') as txt_file:
                    # Loop through each box detected
                    for detection in detections:
                        for box in detection.boxes:
                            # Get the class name, confidence, and coordinates
                            class_name = int(box.cls)
                            confidence = float(box.conf)
                            coordinates = box.xywh.tolist()  # Ensure this returns a flat list
                            txt_file.write(f"{class_name} {confidence} {coordinates}\n")
                
                # Process YOLO output and print the name extracted from labels
                concatenated_result = process_yolo_output(txt_file_path)
                print(concatenated_result)  # Print the result to the console
                
                return render_template('result.html', image_path=url_for('display_latest_image'), concatenated_result=concatenated_result)
    
    return "Prediction failed"

@app.route('/display_latest_image')
def display_latest_image():
    predict_folder = get_latest_predict_folder()
    if predict_folder:
        images = [f for f in os.listdir(predict_folder) if f.endswith(".jpg")]
        if images:
            images.sort(key=lambda x: os.path.getmtime(os.path.join(predict_folder, x)), reverse=True)
            return send_from_directory(predict_folder, images[0])
    return "No images found"

if __name__ == "__main__":
    app.run(debug=True)