import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

const Documents = () => {
  const navigation = useNavigation()
  const greenColor = '#2ECC71';
  const progressBackgroundColor = '#F1F5F9';

  const [driverLicense, setDriverLicense] = useState(null);
  const [vehicleRegistration, setVehicleRegistration] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [licensePlate, setLicensePlate] = useState(null);

  const pickImage = async (key, setImage) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setImage(image.uri);
        await AsyncStorage.setItem(key, JSON.stringify(image));
      }
    } catch (error) {
      console.log("Image picking error:", error);
    }
  };

  const handleProceed = async () => {
    try {
      // Save documents locally
      const documents = {
        driverLicense,
        vehicleRegistration,
        vehiclePhoto,
        licensePlate
      };
      await AsyncStorage.setItem('documents', JSON.stringify(documents));

      // For now, just navigate to next screen
      // Document upload to backend will be handled in the terms screen
      // where all profile data is submitted together
      Toast.show({ type: 'success', text1: 'Documents saved locally' });
      navigation.navigate("profile/payment");
    } catch (error) {
      console.error('Error saving documents:', error);
      Toast.show({ type: 'error', text1: 'Failed to save documents' });
    }
  };

  const UploadPlaceholder = ({ title, image, onPress }) => (
    <TouchableOpacity style={styles.uploadPlaceholder} onPress={onPress}>
      {image ? (
        <Image source={{ uri: image }} style={styles.uploadedImage} />
      ) : (
        <>
          <FontAwesome name="plus" size={20} color="#777" />
          <Text style={styles.placeholderText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const InfoText = ({ text }) => (
    <View style={styles.infoContainer}>
      <MaterialCommunityIcons name="check-circle-outline" size={20} color={greenColor} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
        <View style={[styles.progressBarBackground, { backgroundColor: progressBackgroundColor }]}>
          <View style={[styles.progressBarFill, { backgroundColor: greenColor, width: '60%' }]} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>Step 5 of 7</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Documents upload</Text>
        <Text style={styles.subtitle}>
          To ensure safety and compliance, please upload the necessary driving license and vehicle registration documents.
        </Text>

        <View style={styles.uploadContainer}>
          <UploadPlaceholder
            title="Driver's license"
            image={driverLicense}
            onPress={() => pickImage("driver_license_img", setDriverLicense)}
          />
          <UploadPlaceholder
            title="Vehicle registration"
            image={vehicleRegistration}
            onPress={() => pickImage("vehicle_registration_img", setVehicleRegistration)}
          />
          <UploadPlaceholder
            title="Vehicle photo"
            image={vehiclePhoto}
            onPress={() => pickImage("vehicle_img", setVehiclePhoto)}
          />
          <UploadPlaceholder
            title="License plate"
            image={licensePlate}
            onPress={() => pickImage("license_plate_img", setLicensePlate)}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <InfoText text="Photocopies and printouts will not be accepted" />
          <InfoText text="The photo and all details must be clearly seen" />
        </View>

        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: greenColor, marginTop: 30 }]}
          onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  progressContainer: { width: '100%', marginBottom: 20 },
  progressBarBackground: { width: '100%', height: 5, borderRadius: 100 },
  progressBarFill: { height: 5, borderRadius: 100 },
  stepText: { color: '#475569', marginTop: 10, alignSelf: 'flex-start', fontSize: 12 },
  content: { width: '100%', maxWidth: 400, alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { color: '#777', fontSize: 16, marginBottom: 20 },
  uploadContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  uploadPlaceholder: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedImage: { width: '100%', height: '100%', borderRadius: 10 },
  placeholderText: { color: '#777', marginTop: 10, fontSize: 14, textAlign: 'center' },
  infoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, color: '#333', fontSize: 14 },
  proceedButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default Documents;
