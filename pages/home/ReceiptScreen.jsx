import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import barImg from '../../assets/images/home/bar.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';

const translations = {
  English: {
    E_receipt: 'E-receipt',
    Booking_ID: 'Booking ID',
    Driver: 'Driver',
    Name: 'Name',
    Car_number: 'Car number',
    Car_model: 'Car model',
    Car_Color: 'Car Color',
    Passenger: 'Passenger',
    Phone_number: 'Phone number',
    Transaction_ID: 'Transaction ID',
    Estimated_cost: 'Estimated cost',
    Download_Receipt: 'Download Receipt',
    Email_receipt: 'Email receipt',
  },
  Russian: {
    E_receipt: 'Электронный чек',
    Booking_ID: 'ID бронирования',
    Driver: 'Водитель',
    Name: 'Имя',
    Car_number: 'Номер машины',
    Car_model: 'Модель машины',
    Car_Color: 'Цвет машины',
    Passenger: 'Пассажир',
    Phone_number: 'Номер телефона',
    Transaction_ID: 'ID транзакции',
    Estimated_cost: 'Предполагаемая стоимость',
    Download_Receipt: 'Скачать чек',
    Email_receipt: 'Отправить чек на почту',
  },
  Ukrainian: {
    E_receipt: 'Електронний чек',
    Booking_ID: 'ID бронювання',
    Driver: 'Водій',
    Name: 'Ім\'я',
    Car_number: 'Номер машини',
    Car_model: 'Модель машини',
    Car_Color: 'Колір машини',
    Passenger: 'Пасажир',
    Phone_number: 'Номер телефону',
    Transaction_ID: 'ID транзакції',
    Estimated_cost: 'Орієнтовна вартість',
    Download_Receipt: 'Завантажити чек',
    Email_receipt: 'Надіслати чек на пошту',
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

const Receipt = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#1e293b" : '#fff', padding: 20, paddingVertical: 50 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={isDarkTheme ? "#fff" : "black"} />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 10, color: isDarkTheme && "#fff" }}>{words?.E_receipt || 'E-receipt'}</Text>
      </View>

      {/* Receipt Details */}
      <View style={{ backgroundColor: isDarkTheme ? "#0f172a" : '#fff', borderRadius: 10, padding: 10 }}>
        {/* Booking ID */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <Text style={{ color: isDarkTheme ? "#fff" : '#777', fontSize: 14 }}>{words?.Booking_ID || 'Booking ID'}</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>D353F353623</Text>
        </View>

        {/* Barcode (replace with actual barcode component/image) */}
        {!isDarkTheme && (
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image source={barImg} />
          </View>
        )}

        {/* Driver Information */}
        <View style={{ marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <Text style={{ color: isDarkTheme ? "#fff" : '#777', fontSize: 14, marginBottom: 8 }}>{words?.Driver || 'Driver'}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Name || 'Name'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>Jenny Thompson</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Car_number || 'Car number'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>FD-63F-D893</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Car_model || 'Car model'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>Mercedes AMG</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Car_Color || 'Car Color'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>Red</Text>
          </View>
        </View>

        {/* Passenger Information */}
        <View style={{ marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <Text style={{ color: isDarkTheme ? "#fff" : '#777', fontSize: 14, marginBottom: 8 }}>{words?.Passenger || 'Passenger'}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Name || 'Name'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>Jenny Thompson</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Phone_number || 'Phone number'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>01234676</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Transaction_ID || 'Transaction ID'}</Text>
            <Text style={{ fontSize: 14, color: isDarkTheme ? "#fff" : '#555' }}>2VF34G647422</Text>
          </View>
        </View>

        {/* Estimated Cost */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: isDarkTheme ? "#fff" : '#777', fontSize: 14 }}>{words?.Estimated_cost || 'Estimated cost'}</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: isDarkTheme ? "#fff" : '#333' }}>2VF34G647422</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={{ backgroundColor: '#2ECC71', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 20 }}>
        <Text style={{ color: 'white', fontSize: 16 }}>{words?.Download_Receipt || 'Download Receipt'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ backgroundColor: '#E0F7EF', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: '#2ECC71', fontSize: 16 }}>{words?.Email_receipt || 'Email receipt'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Receipt;