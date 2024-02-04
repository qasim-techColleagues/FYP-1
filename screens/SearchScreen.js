import React, { useState } from 'react';
import { Button, Image, View, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

function SearchScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePressButtonAsync = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];

        setImageUri(selectedAsset.uri);
        const imageType = selectedAsset.mediaType;

        let formData = new FormData();
        formData.append('image', {
          uri: selectedAsset.uri,
          type: imageType === 'video' ? 'video/mp4' : 'image/jpeg',
          name: 'photo.jpg',
        });

        try {
          console.log('Sending Axios request...');
          let response = await axios.post('http://192.168.0.105:5000/predict', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Axios Response:', response.data);
          setPredictionResult(response.data);
        } catch (axiosError) {
          console.error('Axios Error:', axiosError);
          setError('Error during image prediction. Please try again.');
        }
      }
    } catch (imagePickerError) {
      console.error('Error during image selection:', imagePickerError);
      setError('Error during image selection. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
      {predictionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Prediction Result:</Text>
          {Object.entries(predictionResult).map(([className, { count, confidence }], index) => (
            <View key={index}>
              <Text style={styles.resultText}>{`${count} ${className}`}</Text>
              <Text style={styles.resultText}>{`Confidence: ${confidence}`}</Text>
            </View>
          ))}
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button title="Select Image" onPress={handlePressButtonAsync} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginVertical: 10,
  },
  resultContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
  },
});

export default SearchScreen;