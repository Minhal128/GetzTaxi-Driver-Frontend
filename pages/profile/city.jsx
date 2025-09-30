import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const City = () => {
  const navigation = useNavigation();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const greenColor = '#2ECC71';
  const progressBackgroundColor = '#F1F5F9';

  const handleProceed = async () => {
    if (!selectedCountry.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your country' });
      return;
    }
    if (!selectedCity.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your city' });
      return;
    }

    try {
      // Save locally first
      await AsyncStorage.setItem('country', selectedCountry);
      await AsyncStorage.setItem('city', selectedCity);

      // Update backend
      const userId = await AsyncStorage.getItem('user_id');
      const authToken = await AsyncStorage.getItem('authToken');

      if (userId && authToken) {
        const response = await axios.put(`${config.baseUrl}/driver/update/${userId}`, {
          country: selectedCountry,
          city: selectedCity
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 200) {
          Toast.show({ type: 'success', text1: 'Location updated successfully' });
        }
      }

      navigation.navigate('profile/vehicle');
    } catch (error) {
      console.error('Error updating location:', error);
      Toast.show({ type: 'error', text1: 'Failed to update location' });
      // Still navigate even if backend fails
      navigation.navigate('profile/vehicle');
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
          <View style={[styles.progressBarFill, { backgroundColor: greenColor, width: '30%' }]} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>Step 3 of 7</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>City selection</Text>
        <Text style={styles.subtitle}>Required for accurate trip assignment</Text>

        <View style={{ backgroundColor: "#F8FAFC", padding: 15, marginBottom: 20, borderRadius: 10, width: "100%" }}>
          <Text style={{ fontWeight: "600", marginBottom: 5 }}>Area of coverage</Text>
          <Text style={{ color: "#64748B", fontSize: 14 }}>
            Getz only covers some specified areas and not all cities. Choose your preferred city of choice below.
          </Text>
        </View>

        {/* Country Input */}
        <View style={styles.dropdownContainer}>
          <MaterialCommunityIcons name="earth" size={20} color="#777" style={styles.icon} />
          <TextInput
            placeholder="Country"
            style={{ flex: 1 }}
            value={selectedCountry}
            onChangeText={setSelectedCountry}
          />
        </View>

        {/* City Input */}
        <View style={styles.dropdownContainer}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#777" style={styles.icon} />
          <TextInput
            placeholder="City"
            style={{ flex: 1 }}
            value={selectedCity}
            onChangeText={setSelectedCity}
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
  dropdownContainer: {
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

export default City;
