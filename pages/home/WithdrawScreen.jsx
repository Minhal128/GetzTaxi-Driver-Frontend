import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import axios from 'axios';
import config from '../../config';
import Toast from 'react-native-toast-message';

const translations = {
  English: {
    Withdraw: 'Withdraw',
    Payment_method: 'Withdrawal method',
    Continue: 'Continue',
  },
  Russian: {
    Withdraw: 'Вывести',
    Payment_method: 'Способ вывода средств', // More precise
    Continue: 'Продолжить',
  },
  Ukrainian: {
    Withdraw: 'Вивести',
    Payment_method: 'Спосіб виведення коштів', // More precise
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

const Withdraw = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  
  // State management
  const [walletBalance, setWalletBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  
  const predefinedAmounts = ['₴10', '₴20', '₴50', '₴100', '₴200', '₴500'];
  const paymentMethod = 'Bank Transfer';

  // Fetch wallet balance on component mount
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      setFetchingBalance(true);
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      const response = await axios.get(`${config.baseUrl}/trip/wallet`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        const balance = response.data.data.wallet.balance || 0;
        setWalletBalance(balance);
        console.log('✅ Wallet balance fetched:', balance);
      }

    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load wallet balance',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setFetchingBalance(false);
    }
  };

  const handleAmountPress = (value) => {
    // Remove currency symbol and set numeric value
    const numericValue = value.replace('₴', '');
    setAmount(numericValue);
  };

  const handleContinue = async () => {
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    
    if (withdrawalAmount > walletBalance) {
      Alert.alert(
        'Insufficient Funds', 
        `You can only withdraw up to ₴${walletBalance.toFixed(2)}. Your current balance is ₴${walletBalance.toFixed(2)}.`
      );
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ₴${withdrawalAmount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => processWithdrawal(withdrawalAmount) }
      ]
    );
  };

  const processWithdrawal = async (withdrawalAmount) => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      const response = await axios.post(`${config.baseUrl}/trip/withdraw`, {
        amount: withdrawalAmount,
        withdrawalMethod: 'bank_transfer',
        accountDetails: {
          method: paymentMethod
        }
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        const newBalance = response.data.data.newBalance;
        setWalletBalance(newBalance);
        setAmount('');
        
        Toast.show({
          type: 'success',
          text1: 'Withdrawal Successful',
          text2: `₴${withdrawalAmount.toFixed(2)} has been withdrawn. New balance: ₴${newBalance.toFixed(2)}`
        });

        // Navigate back or to a success screen
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      const errorMsg = error.response?.data?.msg || 'Withdrawal failed';
      
      Toast.show({
        type: 'error',
        text1: 'Withdrawal Failed',
        text2: errorMsg
      });

      // If it's an insufficient funds error, refresh the balance
      if (errorMsg.includes('Insufficient funds')) {
        fetchWalletBalance();
      }
    } finally {
      setLoading(false);
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

      {/* Balance Display */}
      <View style={{ margin: 20 }}>
        <Text style={{ color: isDarkTheme ? '#94a3b8' : '#777', fontSize: 14, marginBottom: 5 }}>
          Available Balance: {fetchingBalance ? 'Loading...' : `₴${walletBalance.toFixed(2)}`}
        </Text>
        <TextInput 
          value={amount} 
          onChangeText={setAmount}
          style={{ 
            color: isDarkTheme ? '#fff' : '#333', 
            fontSize: 32, 
            borderBottomWidth: 1, 
            borderBottomColor: isDarkTheme ? "#fff" : "#000", 
            width: "89%",
            paddingVertical: 10
          }} 
          placeholder='Enter amount' 
          placeholderTextColor={isDarkTheme ? '#64748b' : '#9ca3af'}
          keyboardType="numeric"
        />
      </View>

      {/* Predefined Amounts */}
      <View style={styles.predefinedAmountsContainer}>
        {predefinedAmounts.map((value, index) => {
          const isActive = amount === value;
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
            {words?.Payment_method || 'Withdrawal method'}
          </Text>
        </View>
        {/* <Text style={[styles.paymentMethodValue, { color: isDarkTheme ? '#fff' : '#333' }]}>
          {paymentMethod}
        </Text> */}
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity 
        style={[
          styles.continueButton, 
          { 
            opacity: loading || fetchingBalance ? 0.6 : 1,
            backgroundColor: loading || fetchingBalance ? '#94a3b8' : '#2ECC71'
          }
        ]} 
        onPress={handleContinue}
        disabled={loading || fetchingBalance}
      >
        <Text style={styles.continueButtonText}>
          {loading ? 'Processing...' : (words?.Continue || 'Continue')}
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
    maxWidth: 215

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

export default Withdraw;
