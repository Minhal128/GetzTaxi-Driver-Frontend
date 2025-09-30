import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

const paymentMethods = [
  { label: 'Cash', value: 'Cash', icon: 'cash-outline' },
  { label: 'Credit card', value: 'Credit card', icon: 'card-outline' },
  { label: 'Google Pay', value: 'Google Pay', icon: 'logo-google' },
];
const paymentMethods2 = [
  { label: 'Cash', value: 'Cash', icon: 'cash-outline' },
  { label: 'Credit card', value: 'Credit card', icon: 'card-outline' },
  { label: 'Apple Pay', value: 'Apple Pay', icon: 'logo-apple' },
];

const translations = {
  English: {
    Payment_method: 'Payment method',
    Cash: 'Cash',
    Credit_card: 'Credit card',
    Google_Pay: 'Google Pay',
    Apple_Pay: 'Apple Pay',
    Save: 'Save',
  },
  Russian: {
    Payment_method: 'Способ оплаты',
    Cash: 'Наличные',
    Credit_card: 'Кредитная карта',
    Google_Pay: 'Google Pay',
    Apple_Pay: 'Apple Pay',
    Save: 'Сохранить',
  },
  Ukrainian: {
    Payment_method: 'Спосіб оплати',
    Cash: 'Готівка',
    Credit_card: 'Кредитна картка',
    Google_Pay: 'Google Pay',
    Apple_Pay: 'Apple Pay',
    Save: 'Зберегти',
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

const Payment = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Trip data from navigation params
  const tripData = route.params?.tripData;
  const actualDistance = route.params?.actualDistance;
  const actualDuration = route.params?.actualDuration;
  
  // State
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [finalFare, setFinalFare] = useState(tripData?.fare?.totalFare?.toString() || '');
  const [tip, setTip] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  // Complete trip with payment
  const handleCompleteTrip = async () => {
    try {
      if (!finalFare || parseFloat(finalFare) <= 0) {
        Toast.show({ type: 'error', text1: 'Please enter a valid fare amount' });
        return;
      }

      setLoading(true);
      const authToken = await AsyncStorage.getItem('authToken');
      
      const response = await axios.put(`${config.baseUrl}/trip/${tripData._id}/complete`, {
        finalFare: parseFloat(finalFare),
        paymentMethod: selectedMethod,
        tip: parseFloat(tip) || 0,
        actualDistance: actualDistance,
        actualDuration: actualDuration
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        Toast.show({ 
          type: 'success', 
          text1: 'Trip completed successfully!',
          text2: `Earnings: ₴${response.data.data.driverEarnings}`
        });
        
        // Navigate to receipt or earnings screen
        navigation.navigate('home/receipt', { 
          tripData: response.data.data.trip,
          transaction: response.data.data.transaction
        });
      }

    } catch (error) {
      console.error('❌ Error completing trip:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to complete trip',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme && "#0f172a" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Trip</Text>
      </View>

      {/* Trip Summary */}
      {tripData && (
        <View style={[styles.tripSummary, { backgroundColor: isDarkTheme ? '#1E293B' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#fff' : '#333' }]}>Trip Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: isDarkTheme ? '#ccc' : '#666' }]}>Customer:</Text>
            <Text style={[styles.summaryValue, { color: isDarkTheme ? '#fff' : '#333' }]}>{tripData.customerName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: isDarkTheme ? '#ccc' : '#666' }]}>Distance:</Text>
            <Text style={[styles.summaryValue, { color: isDarkTheme ? '#fff' : '#333' }]}>{actualDistance || `${tripData.distance} km`}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: isDarkTheme ? '#ccc' : '#666' }]}>Duration:</Text>
            <Text style={[styles.summaryValue, { color: isDarkTheme ? '#fff' : '#333' }]}>{actualDuration || `${tripData.estimatedDuration} min`}</Text>
          </View>
        </View>
      )}

      {/* Fare Input */}
      <View style={[styles.fareSection, { backgroundColor: isDarkTheme ? '#1E293B' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#fff' : '#333' }]}>Final Fare</Text>
        <View style={styles.fareInputContainer}>
          <Text style={[styles.currencySymbol, { color: isDarkTheme ? '#fff' : '#333' }]}>₴</Text>
          <TextInput
            style={[styles.fareInput, { color: isDarkTheme ? '#fff' : '#333', borderColor: isDarkTheme ? '#374151' : '#E5E7EB' }]}
            value={finalFare}
            onChangeText={setFinalFare}
            keyboardType="numeric"
            placeholder="Enter fare amount"
            placeholderTextColor={isDarkTheme ? '#9CA3AF' : '#6B7280'}
          />
        </View>
        
        {/* Tip Input */}
        <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#fff' : '#333', marginTop: 20 }]}>Tip (Optional)</Text>
        <View style={styles.fareInputContainer}>
          <Text style={[styles.currencySymbol, { color: isDarkTheme ? '#fff' : '#333' }]}>₴</Text>
          <TextInput
            style={[styles.fareInput, { color: isDarkTheme ? '#fff' : '#333', borderColor: isDarkTheme ? '#374151' : '#E5E7EB' }]}
            value={tip}
            onChangeText={setTip}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDarkTheme ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </View>

      {/* Payment Methods List */}
      <View style={styles.paymentList}>
        <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#fff' : '#333', marginBottom: 15 }]}>Payment Method</Text>
        {Platform.OS === "android"
          ? paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[styles.paymentItem, { backgroundColor: isDarkTheme && "#1E293B" }]}
              onPress={() => handleSelectMethod(method.value)}
            >
              <View style={styles.paymentLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={method.icon} size={24} color="#2ECC71" />
                </View>
                <Text style={[styles.paymentLabel, { color: isDarkTheme && "#fff" }]}>
                  {words?.[method.label.replace(' ', '_')] || method.label}
                </Text>
              </View>
              <View style={styles.paymentRight}>
                {selectedMethod === method.value ? (
                  <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
                ) : (
                  <View style={styles.radioCircle} />
                )}
              </View>
            </TouchableOpacity>
          ))
          : paymentMethods2.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[styles.paymentItem, { backgroundColor: isDarkTheme && "#1E293B" }]}
              onPress={() => handleSelectMethod(method.value)}
            >
              <View style={styles.paymentLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={method.icon} size={24} color="#2ECC71" />
                </View>
                <Text style={[styles.paymentLabel, { color: isDarkTheme && "#fff" }]}>
                  {words?.[method.label.replace(' ', '_')] || method.label}
                </Text>
              </View>
              <View style={styles.paymentRight}>
                {selectedMethod === method.value ? (
                  <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
                ) : (
                  <View style={styles.radioCircle} />
                )}
              </View>
            </TouchableOpacity>
          ))}
      </View>

      {/* Complete Trip Button */}
      <TouchableOpacity 
        style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]} 
        onPress={handleCompleteTrip}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Processing...' : 'Complete Trip & Process Payment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#2ECC71',
    paddingTop: 50, // Adjust for status bar
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
  paymentList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#E0F7EF',
    borderRadius: 8,
    padding: 8,
    marginRight: 15,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#333',
  },
  paymentRight: {
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#777',
  },
  saveButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tripSummary: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  fareSection: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
  },
  fareInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  fareInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Payment;