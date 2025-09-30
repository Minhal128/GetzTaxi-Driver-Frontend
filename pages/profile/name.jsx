import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // ✅ updated
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // ✅ updated

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import config from '../../config';
import { useNavigation } from '@react-navigation/core';
import { driverAPI } from '../../services/apiService';

const Name = () => {
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const navigation = useNavigation();
  const greenColor = '#2ecc71';
  const progressBackgroundColor = '#E2E8F0';

  const handleProceed = async () => {
    if (!username.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your full name' });
      return;
    }
    if (!gender.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your gender' });
      return;
    }

    try {
      // Save locally first
      await AsyncStorage.setItem("username", username);
      await AsyncStorage.setItem("gender", gender);

      // Update backend using smart update
      const userId = await AsyncStorage.getItem("user_id");

      if (userId) {
        const response = await driverAPI.smartUpdateProfile(userId, {
          fullName: username,
          gender: gender.toLowerCase()
        });

        if (response.status === 200) {
          Toast.show({ type: 'success', text1: 'Profile updated successfully' });
        }
      }

      navigation.navigate("profile/city");
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({ type: 'error', text1: 'Failed to update profile' });
      // Still navigate even if backend fails
      navigation.navigate("profile/city");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: progressBackgroundColor }]}>
          <View style={[styles.progressBarFill, { backgroundColor: greenColor, width: '20%' }]} />
        </View>
        <Text style={styles.stepText}>Step 2 of 7</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Personal Details</Text>
        <Text style={styles.subtitle}>
          Add your name to personalize your experience. You can update these later
        </Text>

        <View style={styles.inputContainer}>
          <FontAwesome name="user-o" size={20} color="gray" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="gray"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="gender-female" size={23} color="gray" style={{ marginRight: 10 }} />
          <View style={styles.genderContainer}>
            {['male', 'female', 'other'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  gender === option && { backgroundColor: greenColor, borderColor: greenColor }
                ]}
                onPress={() => setGender(option)}
              >
                <Text style={[
                  styles.genderText,
                  gender === option && { color: 'white' }
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: greenColor }]}
          onPress={handleProceed}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 30 },
  progressContainer: { width: '100%', marginBottom: 20 },
  progressBarBackground: { width: '100%', height: 5, borderRadius: 100 },
  progressBarFill: { height: 5, borderRadius: 100 },
  stepText: { color: '#475569', marginTop: 10, alignSelf: 'flex-start' },
  content: { width: '100%', maxWidth: 400, alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { color: '#777', fontSize: 16, marginBottom: 30 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  icon: { marginRight: 15 },
  input: { flex: 1, color: '#333', fontSize: 16, paddingVertical: 15 },
  proceedButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  proceedButtonText: { color: 'white' },
  genderContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  genderText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default Name;
