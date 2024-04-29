import os
import pickle
from flask import Flask, render_template, request, send_from_directory, redirect, url_for
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance, ImageFilter
from ultralytics import YOLO
from scipy.ndimage import median_filter
import numpy as np

app = Flask(__name__)

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

def predict_with_yolo(img_path):
    img = Image.open(img_path)
    yolo = YOLO("best.pt")
    return yolo.predict(img, save=True)

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
                img = brightness_adjustment(img)
                img = gaussian_blur(img)

                img.save(filepath)  # Overwrite the original image with the processed one
                
                detections = predict_with_yolo(filepath)
                pickle_filepath = save_detections_to_pickle(detections)
                if os.path.exists(pickle_filepath):
                    return redirect(url_for('display_latest_image'))
                else:
                    return "Pickling failed"
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
