import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SvgUri } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import CountryCodeModal from '../../components/CountryCodeModal';
import config from '../../config';
import { useNavigation } from '@react-navigation/core';

const EmailScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState({ name: 'America', dial_code: '+1', code: 'US' });
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const greenColor = '#2ECC71';
  const navigation = useNavigation()
  const handleProceed = async () => {
    const fullPhoneNumber = selectedCountryCode.dial_code + phoneNumber;
    if (!phoneNumber) {
      Toast.show({ type: "error", text1: "Please fill in all fields" });
      return;
    }

    try {
      const response = await axios.post(`${config.baseUrl}/driver/send/otp`, { phone_number: fullPhoneNumber });
      const { code, msg } = response.data;
      if (code === 200) {
        Toast.show({ type: 'success', text1: msg });
        console.log(fullPhoneNumber,'fullPhoneNumber')
        AsyncStorage.setItem("phone_number", fullPhoneNumber)
        navigation.navigate("forgot/otp")
      }
      else {
        Toast.show({ type: 'error', text1: msg || 'Failed to resend OTP' });
      }
    } catch (error) {
      const { msg } = error?.response?.data || {};
      Toast.show({ type: 'error', text1: msg || 'Error resending OTP' });
    }

    navigation.navigate("forgot/otp")
  };

  const toggleCountryModal = () => {
    setIsCountryModalVisible(!isCountryModalVisible);
  };
  const handleCountrySelect = (country) => {
    setSelectedCountryCode(country);
    setIsCountryModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.subtitle}>Enter the associated phone number</Text>


      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: "#F8FAFC", padding: 10, borderRadius: 7 }} onPress={toggleCountryModal}>
          <SvgUri width={24} height={24} uri={`https://country-code-au6g.vercel.app/${selectedCountryCode?.code}.svg`} resizeMode="contain" />
          <Text style={{ fontSize: 16, color: '#333', marginLeft: 10 }}>{selectedCountryCode.dial_code}</Text>
        </TouchableOpacity>
        <TextInput placeholderTextColor={"#000"} style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: "#F8FAFC", padding: 10, borderRadius: 7 }} placeholder="Phone number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
      </View>

      <TouchableOpacity style={[styles.proceedButton, { backgroundColor: greenColor }]} onPress={handleProceed}>
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>

      <CountryCodeModal isVisible={isCountryModalVisible} onClose={toggleCountryModal} onSelect={handleCountrySelect} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 30,
    paddingTop: 50
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
    marginBottom: 20,
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
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default EmailScreen;