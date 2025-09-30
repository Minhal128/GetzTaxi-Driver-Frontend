import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

const Vehicle = () => {
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation()
  const greenColor = '#2ECC71';
  const progressBackgroundColor = '#F1F5F9';

  const handleProceed = async () => {
    if (!vehicleMake.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter vehicle make' });
      return;
    }
    if (!vehicleColor.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter vehicle color' });
      return;
    }
    if (!registrationNumber.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter registration number' });
      return;
    }

    try {
      setLoading(true);
      // Save locally first
      await AsyncStorage.setItem('vehicle_make', vehicleMake);
      await AsyncStorage.setItem('vehicle_color', vehicleColor);
      await AsyncStorage.setItem('vehicle_registration_number', registrationNumber);

      // Update backend
      const userId = await AsyncStorage.getItem('user_id');
      const authToken = await AsyncStorage.getItem('authToken');

      if (userId && authToken) {
        const response = await axios.put(`${config.baseUrl}/driver/update/${userId}`, {
          vehicle: {
            maker: vehicleMake,
            color: vehicleColor,
            registrationNumber: registrationNumber
          }
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 200) {
          Toast.show({ type: 'success', text1: 'Vehicle info updated successfully' });
        }
      }

      navigation.navigate('profile/documents');
    } catch (error) {
      console.error('Error updating vehicle info:', error);
      Toast.show({ type: 'error', text1: 'Failed to update vehicle info' });
      // Still navigate even if backend fails
      navigation.navigate('profile/documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation & Progress */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
        <View style={[styles.progressBarBackground, { backgroundColor: progressBackgroundColor }]}>
          <View style={[styles.progressBarFill, { backgroundColor: greenColor, width: '40%' }]} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>Step 4 of 7</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Vehicle Information</Text>
        <Text style={styles.subtitle}>Enter your vehicle details to match you with the right passengers</Text>

        {/* Vehicle Make */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="car" size={20} color="#777" style={styles.icon} />
          <TextInput
            placeholder="Vehicle make"
            style={{ flex: 1 }}
            value={vehicleMake}
            onChangeText={setVehicleMake}
          />
        </View>

        {/* Vehicle Color */}
        <View style={styles.inputContainer}>
          <Ionicons name="color-palette" size={20} color="#777" style={styles.icon} />
          <TextInput
            placeholder="Vehicle color"
            style={{ flex: 1 }}
            value={vehicleColor}
            onChangeText={setVehicleColor}
          />
        </View>

        {/* Vehicle Registration Number */}
        <View style={styles.inputContainer}>
          <Entypo name="location-pin" size={20} color="#777" style={styles.icon} />
          <TextInput
            placeholder="Vehicle registration number"
            style={{ flex: 1 }}
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
          />
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: greenColor, marginTop: 20 }]}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    width: '100%',
  },
  icon: { marginRight: 15 },
  proceedButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default Vehicle;