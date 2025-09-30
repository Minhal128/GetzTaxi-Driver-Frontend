import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config';
import { useNavigation } from '@react-navigation/core';
import { driverAPI } from '../../services/apiService';

const Terms = () => {
  const [agreed, setAgreed] = useState(false);
  const greenColor = '#2ECC71';
  const progressBackgroundColor = '#F1F5F9';
  const navigation = useNavigation()
  const handleAgreementToggle = () => {
    setAgreed(!agreed);
  };

  const handleProceed = async () => {
    if (agreed) {
      try {
        Toast.show({ type: 'info', text1: 'Updating profile, please wait...', autoHide: false, });
        const userId = await AsyncStorage.getItem('user_id');
        const username = await AsyncStorage.getItem('username');
        const gender = await AsyncStorage.getItem('gender');
        const country = await AsyncStorage.getItem('country')
        const city = await AsyncStorage.getItem('city')
        const vehicle_make = await AsyncStorage.getItem('vehicle_make')
        const vehicle_color = await AsyncStorage.getItem('vehicle_color')
        const vehicle_registration_number = await AsyncStorage.getItem('vehicle_registration_number')
        const payment_method = await AsyncStorage.getItem('payment_method');

        // Get images safely with null checks
        const vehicle_registration_img_str = await AsyncStorage.getItem('vehicle_registration_img');
        const driver_license_img_str = await AsyncStorage.getItem('driver_license_img');
        const vehicle_img_str = await AsyncStorage.getItem('vehicle_img');
        const license_plate_img_str = await AsyncStorage.getItem('license_plate_img');

        const vehicle_registration_img = vehicle_registration_img_str ? JSON.parse(vehicle_registration_img_str) : null;
        const driver_license_img = driver_license_img_str ? JSON.parse(driver_license_img_str) : null;
        const vehicle_img = vehicle_img_str ? JSON.parse(vehicle_img_str) : null;
        const license_plate_img = license_plate_img_str ? JSON.parse(license_plate_img_str) : null;

        const formData = new FormData();
        
        // Only append files if they exist
        if (vehicle_registration_img?.uri) {
          formData.append("vehicleRegistration", {
            uri: vehicle_registration_img.uri,
            name: vehicle_registration_img.fileName || 'vehicle_registration.jpg',
            type: vehicle_registration_img.mimeType || 'image/jpeg',
          });
        }
        
        if (driver_license_img?.uri) {
          formData.append("drivingLicense", {
            uri: driver_license_img.uri,
            name: driver_license_img.fileName || 'driving_license.jpg',
            type: driver_license_img.mimeType || 'image/jpeg',
          });
        }
        
        if (vehicle_img?.uri) {
          formData.append("vehiclePhoto", {
            uri: vehicle_img.uri,
            name: vehicle_img.fileName || 'vehicle_photo.jpg',
            type: vehicle_img.mimeType || 'image/jpeg',
          });
        }
        
        if (license_plate_img?.uri) {
          formData.append("licensePlate", {
            uri: license_plate_img.uri,
            name: license_plate_img.fileName || 'license_plate.jpg',
            type: license_plate_img.mimeType || 'image/jpeg',
          });
        }

        formData.append("fullName", username);
        formData.append("gender", gender?.toLowerCase() || "");
        formData.append("city", city);
        formData.append("vehicle[maker]", vehicle_make);
        formData.append("vehicle[color]", vehicle_color);
        formData.append("vehicle[registrationNumber]", vehicle_registration_number);
        formData.append("country", country);
        formData.append("paymentMethod", payment_method);
        formData.append("agreedToTerms", "true");

        console.log('📤 Submitting profile data for userId:', userId);
        console.log('🌐 API Endpoint:', `${config.baseUrl}/driver/update/${userId}`);
        console.log('🔑 Auth Token:', await AsyncStorage.getItem('authToken') ? 'Present' : 'Missing');
        console.log('📊 FormData contents:', {
          hasVehicleRegistration: !!vehicle_registration_img?.uri,
          hasDrivingLicense: !!driver_license_img?.uri,
          hasVehiclePhoto: !!vehicle_img?.uri,
          hasLicensePlate: !!license_plate_img?.uri,
          fullName: username,
          gender: gender?.toLowerCase(),
          city: city,
          country: country,
          paymentMethod: payment_method
        });

        // Try FormData first, fallback to JSON if it fails
        let res;
        try {
          res = await driverAPI.smartUpdateProfile(userId, formData);
        } catch (formDataError) {
          console.log('📝 FormData failed, trying JSON approach...');
          // Fallback to JSON-only approach
          res = await driverAPI.smartUpdateProfile(userId, {
            fullName: username,
            gender: gender?.toLowerCase() || "",
            city: city,
            country: country,
            paymentMethod: payment_method,
            agreedToTerms: true,
            vehicle: {
              maker: vehicle_make,
              color: vehicle_color,
              registrationNumber: vehicle_registration_number
            }
          });
        }
        Toast.hide();

        if (res.status === 200) {
          Toast.show({ type: 'success', text1: 'Profile updated successfully' });
          
          // Store complete user profile data and token after successful setup
          try {
            const responseData = res.data || res;
            const userData = responseData.data || responseData;
            
            console.log('✅ Profile setup response:', responseData);
            
            // Store the complete profile data from backend response
            await AsyncStorage.setItem("userProfile", JSON.stringify({ data: userData }));
            console.log('✅ Complete profile stored from backend response');
            
            // Store authentication token if provided
            if (userData.token) {
              await AsyncStorage.setItem("authToken", userData.token);
              await AsyncStorage.setItem("language", "English");
              console.log('✅ Authentication token stored for new user');
            }
            
          } catch (profileError) {
            console.error('❌ Error storing complete profile:', profileError);
          }
          
          setTimeout(() => {
            navigation.navigate('profile/final');
          }, 1000);
        } else {
          Toast.show({ type: 'error', text1: 'Failed to update profile' });
        }

      } catch (error) {
        console.error('❌ Error submitting data:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });
        Toast.hide();
        
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          Toast.show({ 
            type: 'error', 
            text1: 'Network Error', 
            text2: 'Please check your internet connection' 
          });
        } else if (error.response?.status === 413) {
          Toast.show({ 
            type: 'error', 
            text1: 'Files too large', 
            text2: 'Please use smaller images' 
          });
        } else {
          Toast.show({ 
            type: 'error', 
            text1: 'Something went wrong', 
            text2: error.response?.data?.msg || error.message 
          });
        }
      }
    } else {
      alert('Please agree to the terms and conditions to proceed.');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: progressBackgroundColor }]}>
          <View style={[styles.progressBarFill, { backgroundColor: greenColor, width: '100%' }]} />
        </View>
        <Text style={styles.stepText}>Step 7 of 7</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Terms and conditions</Text>
        <Text style={styles.subtitle}>Review our terms and conditions</Text>

        <ScrollView style={styles.termsTextContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.termsHeading}>1. Account Registration</Text>
          <Text style={styles.termsParagraph}>By creating an account, you agree to provide accurate information and keep your login details secure.</Text>

          <Text style={styles.termsHeading}>2. Service Usage</Text>
          <Text style={styles.termsParagraph}>You agree to use the app for legal purposes only, including booking rides and sending parcels. Any misuse may result in account suspension.</Text>

          <Text style={styles.termsHeading}>3. Payments & Refunds</Text>
          <Text style={styles.termsParagraph}>All payments via Liqpay are final. Refunds for canceled trips are subject to our policy. Cash payments are made directly to the driver.</Text>

          <Text style={styles.termsHeading}>4. Privacy & Data Protection</Text>
          <Text style={styles.termsParagraph}>We collect and store necessary information to provide our services. Your data will not be shared without consent, except as required by law.</Text>

          <Text style={styles.termsHeading}>5. Liability</Text>
          <Text style={styles.termsParagraph}>We are not responsible for lost items, service delays, or disputes between users and drivers.</Text>

          <Text style={styles.termsHeading}>6. Updates & Changes</Text>
          <Text style={styles.termsParagraph}>We may update these terms periodically. Continued use of the app means you accept any changes.</Text>

          <Text style={styles.termsHeading}>7. Contact</Text>
          <Text style={styles.termsParagraph}>For support, reach out via [customer support email/phone].</Text>
        </ScrollView>

        <TouchableOpacity style={styles.agreementContainer} onPress={handleAgreementToggle}>
          <AntDesign name={agreed ? 'checkcircle' : 'checkcircleo'} size={20} color={agreed ? greenColor : '#666'} style={styles.agreementCheckbox} />
          <Text style={styles.agreementText}>By signing up, you agree to these <Text style={{ fontWeight: 'bold', color: greenColor }}>terms</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.proceedButton, { backgroundColor: greenColor, opacity: agreed ? 1 : 0.5 }]} onPress={handleProceed} disabled={!agreed}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 5,
    borderRadius: 100,
  },
  progressBarFill: {
    height: 5,
    borderRadius: 100,
  },
  stepText: {
    color: '#475569',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    color: '#777',
    fontSize: 16,
    marginBottom: 20,
  },
  termsTextContainer: {
    flexGrow: 1,
    marginBottom: 20,
  },
  termsHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  termsParagraph: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  agreementCheckbox: {
    marginRight: 12,
  },
  agreementText: {
    color: '#333',
    fontSize: 14,
    flex: 1,
  },
  proceedButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  proceedButtonText: {
    color: 'white',
  },
});

export default Terms;