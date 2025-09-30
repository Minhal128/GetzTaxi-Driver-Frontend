import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';

const translations = {
  English: {
    Notifications: 'Notifications',
    Today: 'Today',
    Ride_request_from_Mart: 'Ride request from Mart',
    Buy_any_any_item_today_and_get_25_off_Offer_last_24h:
      'Buy any any item today and get 25% off. Offer last 24h',
    Pre_book_cancelled: 'Pre-book cancelled',
    Your_pre_booked_trip_with_Shey_was_cancelled:
      'Your pre-booked trip with Shey was cancelled',
    Received_payment: 'Received payment',
    You_just_received_a_payment_from_Annie: 'You just received a payment from Annie',
    Fst_March_2025: '1st March, 2025',
    Ride_cancel_successfully: 'Ride cancel successfully',
    You_just_made_a_payment_for_taxi_Enjoy_your_ride:
      'You just made a payment for taxi. Enjoy your ride!',
  },
  Russian: {
    Notifications: 'Уведомления',
    Today: 'Сегодня',
    Ride_request_from_Mart: 'Запрос на поездку от Mart',
    Buy_any_any_item_today_and_get_25_off_Offer_last_24h:
      'Купите любой товар сегодня и получите скидку 25%. Предложение действует 24 часа',
    Pre_book_cancelled: 'Предзаказ отменен',
    Your_pre_booked_trip_with_Shey_was_cancelled:
      'Ваша предварительно забронированная поездка с Shey была отменена',
    Received_payment: 'Получен платеж',
    You_just_received_a_payment_from_Annie:
      'Вы только что получили платеж от Annie',
    Fst_March_2025: '1 марта 2025 г.',
    Ride_cancel_successfully: 'Поездка успешно отменена',
    You_just_made_a_payment_for_taxi_Enjoy_your_ride:
      'Вы только что оплатили такси. Приятной поездки!',
  },
  Ukrainian: {
    Notifications: 'Сповіщення',
    Today: 'Сьогодні',
    Ride_request_from_Mart: 'Запит на поїздку від Mart',
    Buy_any_any_item_today_and_get_25_off_Offer_last_24h:
      'Купуйте будь-який товар сьогодні та отримайте знижку 25%. Пропозиція діє 24 години',
    Pre_book_cancelled: 'Попереднє замовлення скасовано',
    Your_pre_booked_trip_with_Shey_was_cancelled:
      'Вашу попередньо заброньовану поїздку з Shey було скасовано',
    Received_payment: 'Отримано платіж',
    You_just_received_a_payment_from_Annie:
      'Ви щойно отримали платіж від Annie',
    Fst_March_2025: '1 березня 2025 р.',
    Ride_cancel_successfully: 'Поїздку успішно скасовано',
    You_just_made_a_payment_for_taxi_Enjoy_your_ride:
      'Ви щойно здійснили оплату за таксі. Насолоджуйтесь поїздкою!',
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

const NotificationScreen = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const notifications = [
    {
      date: 'Today',
      items: [
        {
          icon: 'car-outline',
          iconColor: '#2ECC71',
          title: 'Ride request from Mart',
          subtitle: 'Buy any any item today and get 25% off. Offer last 24h',
        },
        {
          icon: 'close-circle-outline',
          iconColor: '#FF6B6B',
          title: 'Pre-book cancelled',
          subtitle: 'Your pre-booked trip with Shey was cancelled',
        },
        {
          icon: 'card-outline',
          iconColor: '#2ECC71',
          title: 'Received payment',
          subtitle: 'You just received a payment from Annie',
        },
      ],
    },
    {
      date: '1st March, 2025',
      items: [
        {
          icon: 'close-circle-outline',
          iconColor: '#FF6B6B',
          title: 'Ride cancel successfully',
          subtitle: 'You just made a payment for taxi. Enjoy your ride!',
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#0f172a' : '#fff' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#2ECC71',
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#fff' }}>
          {words?.Notifications || 'Notifications'}
        </Text>
      </View>

      {/* Notification List */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {notifications.map((section, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: isDarkTheme ? '#f1f5f9' : '#333',
                marginBottom: 10,
                fontWeight: '500',
              }}
            >
              {words?.[section.date.replace(/,?\s/g, '_')] || section.date}
            </Text>
            {section.items.map((item, itemIndex) => {
              const isGreen = item.iconColor === '#2ECC71';
              const lightBg = isGreen ? '#E0F7EF' : '#FFE3E3';
              const darkBg = isGreen ? '#064e3b' : '#7f1d1d';

              return (
                <View
                  key={itemIndex}
                  style={{
                    backgroundColor: isDarkTheme ? '#1e293b' : '#F8FAFC',
                    borderRadius: 10,
                    padding: 15,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isDarkTheme ? darkBg : lightBg,
                      borderRadius: 100,
                      padding: 10,
                      marginRight: 15,
                    }}
                  >
                    <Ionicons name={item.icon} size={24} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: isDarkTheme ? '#f1f5f9' : '#333',
                        marginBottom: 3,
                      }}
                    >
                      {words?.[item.title.replace(/\s/g, '_')] || item.title}
                    </Text>
                    <Text style={{ color: isDarkTheme ? '#cbd5e1' : '#777', fontSize: 14 }}>
                      {words?.[item.subtitle.replace(/\s/g, '_')] || item.subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;