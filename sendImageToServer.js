import axios from "axios";

const sendImageToServer = async (selectedImage, FLASK_SERVER_URL) => {
  if (!selectedImage) {
    throw new Error('No image selected');
  }
  
  const formData = new FormData();
  formData.append('file', {
    uri: selectedImage,
    type: 'image/jpeg',
    name: 'image.jpg',
  });

  try {
    console.log('Sending request to server:', `${FLASK_SERVER_URL}/predict_img`);
    const response = await axios.post(`${FLASK_SERVER_URL}/predict_img`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Response from server:', response.data);
     // Use a regular expression to extract text within <p> tags
     const regex = /<p>(.*?)<\/p>/;
     const match = response.data.match(regex);
     const resultText = match ? match[1] : 'No result found';
     console.log('Result text:', resultText);
     return resultText;
  } catch (error) {
    console.error('Error sending image to server:', error);
    
    // Log Axios error response if available
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // Log Axios request if no response was received
      console.error('Error request:', error.request);
    } else {
      // Log any other errors that occurred
      console.error('Error message:', error.message);
    }
    
    throw new Error('An error occurred while sending the image to the server.');
  }
};

export default sendImageToServer;
