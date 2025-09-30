import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import config from '../../config'; // adjust path if needed

const Password = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const greenColor = '#2ECC71';

  const handleProceed = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      const phone_number = await AsyncStorage.getItem('phone_number');
      if (!phone_number) {
        Toast.show({
          type: 'error',
          text1: 'Phone number not found',
          text2: 'Please restart the process',
        });
        return;
      }

      const response = await axios.post(`${config.baseUrl}/driver/change/password`, {
        phone_number,
        password,
      });

      if (response.data.code === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password changed successfully',
        });
        navigation.navigate('forgot/final');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: response.data.msg,
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.msg || 'Something went wrong',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a new password</Text>
      <Text style={styles.subtitle}>Create a new password</Text>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="gray"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="gray"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.proceedButton, { backgroundColor: greenColor }]}
        onPress={handleProceed}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Password;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 30,
    paddingTop: 60
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    color: '#777',
    fontSize: 16,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    paddingVertical: 15,
  },
  proceedButton: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
  },
});