import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'; // ✅ updated
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // ✅ updated
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // ✅ updated

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

const Payment = () => {
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const greenColor = '#2ECC71';
  const progressBackgroundColor = '#F1F5F9';
  const navigation = useNavigation();

  const handlePaymentSelect = (payment) => {
    setSelectedPayment(payment);
  };

  const handleProceed = async () => {
    try {
      // Save locally first
      await AsyncStorage.setItem('payment_method', selectedPayment);

      // Update backend
      const userId = await AsyncStorage.getItem('user_id');
      const authToken = await AsyncStorage.getItem('authToken');

      if (userId && authToken) {
        const response = await axios.put(`${config.baseUrl}/driver/update/${userId}`, {
          paymentMethod: selectedPayment
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === 200) {
          Toast.show({ type: 'success', text1: 'Payment method saved successfully' });
        }
      }

      navigation.navigate("profile/terms");
    } catch (error) {
      console.error('Error saving payment method:', error);
      Toast.show({ type: 'error', text1: 'Failed to save payment method' });
      // Still navigate even if backend fails
      navigation.navigate("profile/terms");
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
        <View
          style={[styles.progressBarBackground, { backgroundColor: progressBackgroundColor }]}
        >
          <View
            style={[styles.progressBarFill, { backgroundColor: greenColor, width: "80%" }]}
          />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>Step 6 of 7</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Payment method</Text>
        <Text style={styles.subtitle}>Set your preferred payment method</Text>

        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => handlePaymentSelect("Cash")}
        >
          <FontAwesome name="money" size={20} color="#14AE5C" style={styles.paymentIcon} />
          <Text style={styles.paymentText}>LiqPay</Text>
          {selectedPayment === "Cash" && (
            <AntDesign name="checkcircle" size={24} color={greenColor} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentOption}
          onPress={() => handlePaymentSelect("Google Pay")}
        >
          <FontAwesome5 name="google-pay" size={24} color="blue" />
          <Text style={styles.paymentText}>Bank account</Text>
          {selectedPayment === "Google Pay" && (
            <AntDesign name="checkcircle" size={24} color={greenColor} />
          )}
        </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 20 },
  progressContainer: { width: "100%", marginBottom: 20 },
  progressBarBackground: { width: "100%", height: 5, borderRadius: 100 },
  progressBarFill: { height: 5, borderRadius: 100 },
  stepText: { color: "#475569", marginTop: 10, alignSelf: "flex-start" },
  content: { width: "100%", maxWidth: 400, alignItems: "flex-start" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: { color: "#777", fontSize: 16, marginBottom: 30 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#eee",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  paymentText: { fontSize: 18, color: "#333", marginLeft: 10, flex: 1 },
  paymentIcon: { width: 20, textAlign: "center" },
  proceedButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  proceedButtonText: { color: "white" },
});

export default Payment;
