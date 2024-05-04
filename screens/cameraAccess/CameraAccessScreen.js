// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, Image, TouchableOpacity, Alert ,Platform} from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';
// import {  requestCameraPermission, pickImageFromGallery, takePicture } from "./components/CameraAccess"; // Import camera access functions
// import { saveImage } from './components/SaveImage'; // Import save image function

// const CameraAccessScreen = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [labeledImage, setLabeledImage] = useState(null);

//   useEffect(() => {
//     (async () => {
//       if (Platform.OS !== 'web') {
//         await requestCameraPermission(); // Call camera permission function
//       }
//     })();
//   }, []);

//   const requestCameraPermission = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'Please grant access to the camera roll to proceed.');
//     }
//   };

//   const FLASK_SERVER_URL = 'http://192.168.74.157:81'; 

//   const sendImageToServer = async () => {
//     if (!selectedImage) {
//       Alert.alert('No image selected', 'Please select an image first.');
//       return;
//     }
    
//     const formData = new FormData();
//     formData.append('file', {
//       uri: selectedImage,
//       type: 'image/jpeg',
//       name: 'image.jpg',
//     });
  
//     try {
//       const response = await axios.post(`${FLASK_SERVER_URL}/predict_img`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       // Log the response from the server
//       console.log('Response from server:', response.data);
      
//       // Assuming the Flask server responds with the labeled image URI
//       const labeledImageUri = response.data.labeledImage;
  
//       setLabeledImage(labeledImageUri);
//     } catch (error) {
//       console.error('Error sending image to server:', error);
//       Alert.alert('Error', 'An error occurred while sending the image to the server.');
//     }
//   };
  
 
//   const handleSaveImage = async () => {
//     if (labeledImage) {
//       await saveImage(labeledImage); // Call save image function
//     } else {
//       Alert.alert('No image to save', 'Please label an image first.');
//     }
//   };

//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Text style={{ marginBottom: 20 }}>Selected Image:</Text>
//       {selectedImage ? (
//         <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />
//       ) : (
//         <Text>No image selected</Text>
//       )}
//       <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
//       <Button title="Pick from Gallery" onPress={() => {
//         pickImageFromGallery().then(uri => {
//             console.log("Gallery Image URI:", uri);
//             setSelectedImage(uri);
//         })
//         }} />
//         <Button title="Take Picture" onPress={() => {
//         takePicture().then(uri => {
//             console.log("Camera Image URI:", uri);
//             setSelectedImage(uri);
//         })
//         }} />
        
//       </View>
//       {selectedImage && (
//         <TouchableOpacity style={{ marginTop: 20 }} onPress={sendImageToServer}>
//           <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Send Image to Server</Text>
//         </TouchableOpacity>
        
//       )}
//       {labeledImage && (
//         <View style={{ marginTop: 20 }}>
//           <Text style={{ marginBottom: 10 }}>Labeled Image:</Text>
//           <Image source={{ uri: labeledImage }} style={{ width: 200, height: 200 }} />
//           <TouchableOpacity style={{ marginTop: 10 }} onPress={handleSaveImage}>
//             <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Save Labeled Image</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// export default CameraAccessScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { requestCameraPermission, pickImageFromGallery, takePicture } from "./components/CameraAccess";
import { saveImage } from './components/SaveImage';

const CameraAccessScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Please enable access to your camera and photo gallery.');
        }
      }
    })();
  }, []);

  const FLASK_SERVER_URL = 'http://192.168.74.157:81';

  const sendImageToServer = async () => {
    if (!selectedImage) {
      Alert.alert('No image selected', 'Please select or capture an image first.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
  
    try {
      const response = await axios.post(`${FLASK_SERVER_URL}/predict_img`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Image has been sent successfully!');
    } catch (error) {
      console.error('Error sending image to server:', error);
      Alert.alert('Error', 'An error occurred while sending the image to the server.');
    }
  };

  const handleCapture = async () => {
    const uri = await takePicture();
    if (!uri) {
      Alert.alert('Capture Failed', 'No image was captured.');
      return;
    }
    setSelectedImage(uri);
  };

  const handleUpload = async () => {
    const uri = await pickImageFromGallery();
    if (!uri) {
      Alert.alert('Upload Failed', 'No image was selected.');
      return;
    }
    setSelectedImage(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Upload Image</Text>
      <View style={styles.imagePreview}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View>
          <MaterialIcons name="cloud-upload" size={50} color="#fff" />
          <Text style={styles.imagePlaceholder}>Upload</Text></View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <MaterialIcons name="photo-library" size={28} color="white" />
          <Text style={styles.buttonText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCapture}>
          <MaterialIcons name="camera-alt" size={28} color="white" />
          <Text style={styles.buttonText}>Capture</Text>
        </TouchableOpacity>
      </View>
      {selectedImage && (<View>
        <TouchableOpacity style={styles.button} onPress={sendImageToServer}>
        
          <MaterialIcons name="key" size={28} color="white" />
         
          <Text style={styles.buttonText}>Decipher</Text>
        </TouchableOpacity></View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#CDE8E5'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff'
  },
  imagePreview: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#fff',
    borderWidth: 4,
    borderRadius: 10,
    backgroundColor: '#CDE8E5',
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#666',
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#7AB2B2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    marginLeft: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: '500'
  },
  sendButton: {
    backgroundColor: '#7AB2B2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    display:'flex',
    
  }
});

export default CameraAccessScreen;


