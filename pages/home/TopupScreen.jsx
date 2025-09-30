import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import config from '../../config';

const translations = {
  English: {
    Withdraw: 'Top Up',
    Payment_method: 'Payment method',
    Continue: 'Continue',
  },
  Russian: {
    Withdraw: 'Пополнить',
    Payment_method: 'Способ оплаты',
    Continue: 'Продолжить',
  },
  Ukrainian: {
    Withdraw: 'Поповнити',
    Payment_method: 'Спосіб оплати',
    Continue: 'Продовжити',
  },
};

const getTranslations = async (language) => {
  try {
    if (translations[language]) {
      return translations[language];
    }
    return translations["English"];
  } catch (error) {
    console.error("Error fetching language:", error);
    return translations["English"];
  }
};

const useLanguage = () => {
  const [words, setWords] = useState(translations.English);

  useFocusEffect(
    useCallback(() => {
      const fetchTranslations = async () => {
        const language = await AsyncStorage.getItem("language");
        const translatedWords = await getTranslations(language);
        setWords(translatedWords);
      };
      fetchTranslations();
    }, [])
  );

  return words;
};

const Topup = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const predefinedAmounts = ['₴10', '₴20', '₴50', '₴100', '₴200', '₴500'];
  const paymentMethod = 'Hutko';
  const navigation = useNavigation();
  
  const handleAmountPress = (value) => {
    // Remove ₴ symbol and set numeric value
    const numericValue = value.replace('₴', '');
    setAmount(numericValue);
  };

  const handleContinue = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to top up.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount < 10) {
      Alert.alert('Minimum Amount', 'Minimum top-up amount is ₴10.');
      return;
    }

    setIsLoading(true);
    console.log('Continue with top-up:', `₴${amount}`, 'via', paymentMethod);

    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again.');
        navigation.navigate('login');
        return;
      }

      console.log('🔑 Token found, making API call...');
      console.log('🔑 Token length:', token.length);
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      console.log('🌐 API URL:', `${config.baseUrl}/payment/topup`);

      // Call Hutko top-up API
      const response = await fetch(`${config.baseUrl}/payment/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: numericAmount,
          currency: 'UAH',
          description: `Wallet top-up: ₴${amount}`,
        }),
      });

      const data = await response.json();
      console.log('📡 API Response:', response.status, data);

      if (response.ok && data.status === 200) {
        console.log('✅ Top-up invoice created:', data.data);
        
        // Open Hutko payment URL
        if (data.data.paymentUrl) {
          const supported = await Linking.canOpenURL(data.data.paymentUrl);
          if (supported) {
            await Linking.openURL(data.data.paymentUrl);
          } else {
            Alert.alert('Error', 'Cannot open payment page. Please try again.');
          }
        } else {
          Alert.alert('Success', 'Top-up request created successfully!');
        }
        
        // Navigate back after successful creation
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
        
      } else {
        console.error('❌ Top-up failed:', response.status, data);
        
        // Handle specific error cases
        if (response.status === 401) {
          Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
          navigation.navigate('login');
        } else if (response.status === 403) {
          Alert.alert('Access Denied', data.msg || 'You do not have permission to perform this action.');
        } else {
          Alert.alert('Top-up Failed', data.msg || 'Failed to create top-up request. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Top-up error:', error);
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? '#0f172a' : '#F8FAFC' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{words?.Withdraw || 'Withdraw'}</Text>
      </View>

      {/* Amount Display */}
      <TextInput 
        value={amount} 
        onChangeText={setAmount}
        style={{ 
          margin: 20, 
          color: isDarkTheme ? '#fff' : '#333', 
          fontSize: 32, 
          borderBottomWidth: 1, 
          borderBottomColor: isDarkTheme ? "#fff" : "#000", 
          width: "89%", 
        }} 
        placeholder='Enter amount (₴)' 
        placeholderTextColor={isDarkTheme ? '#64748b' : '#94a3b8'}
        keyboardType="numeric"
      />

      {/* Predefined Amounts */}
      <View style={styles.predefinedAmountsContainer}>
        {predefinedAmounts.map((value, index) => {
          const numericValue = value.replace('₴', '');
          const isActive = amount === numericValue;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.predefinedAmountButton,
                {
                  backgroundColor: isActive ? '#2ECC71' : isDarkTheme ? '#1e293b' : '#fff',
                  borderColor: isActive ? '#2ECC71' : isDarkTheme ? '#334155' : '#ddd',
                },
              ]}
              onPress={() => handleAmountPress(value)}
            >
              <Text
                style={[
                  styles.predefinedAmountText,
                  {
                    color: isActive ? '#fff' : isDarkTheme ? '#cbd5e1' : '#333',
                  },
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Payment Method */}
      <TouchableOpacity
        // onPress={() => navigation.navigate('home/payment')}
        style={[
          styles.paymentMethodContainer,
          { backgroundColor: isDarkTheme ? '#1e293b' : '#fff' },
        ]}
      >
        <View style={styles.paymentMethodLeft}>
          <Ionicons name="card" size={20} color={isDarkTheme ? '#94a3b8' : '#777'} style={{ marginRight: 5 }} />
          <Text style={[styles.paymentMethodLabel, { color: isDarkTheme ? '#94a3b8' : '#777' }]}>
            {words?.Payment_method || 'Payment method'}
          </Text>
        </View>
        <Text style={[styles.paymentMethodValue, { color: isDarkTheme ? '#fff' : '#333' }]}>
          {paymentMethod}
        </Text>
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity 
        style={[
          styles.continueButton, 
          { 
            backgroundColor: isLoading ? '#94a3b8' : '#2ECC71',
            opacity: isLoading ? 0.7 : 1 
          }
        ]} 
        onPress={handleContinue}
        disabled={isLoading}
      >
        <Text style={styles.continueButtonText}>
          {isLoading ? 'Processing...' : (words?.Continue || 'Continue')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2ECC71',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  predefinedAmountsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  predefinedAmountButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  predefinedAmountText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  paymentMethodLabel: {
    fontSize: 16,
  },
  paymentMethodValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Topup;
