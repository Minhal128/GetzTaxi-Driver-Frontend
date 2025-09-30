import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';

const translations = {
  English: {
    Notifications: 'Notifications',
    Trip_alerts: 'Trip alerts',
    Earnings_payment: 'Earnings & payment',
    Promotions: 'Promotions',
    App_updates: 'App updates',
    Security_alerts: 'Security alerts',
  },
  Russian: {
    Notifications: 'Уведомления',
    Trip_alerts: 'Оповещения о поездках',
    Earnings_payment: 'Заработки и выплаты',
    Promotions: 'Акции',
    App_updates: 'Обновления приложения',
    Security_alerts: 'Оповещения о безопасности',
  },
  Ukrainian: {
    Notifications: 'Сповіщення',
    Trip_alerts: 'Сповіщення про поїздки',
    Earnings_payment: 'Заробітки та виплати',
    Promotions: 'Акції',
    App_updates: 'Оновлення програми',
    Security_alerts: 'Сповіщення про безпеку',
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
const NotificationSettings = () => {
  const navigation = useNavigation();
  const [tripAlertsEnabled, setTripAlertsEnabled] = useState(true);
  const [earningsPaymentEnabled, setEarningsPaymentEnabled] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);
  const [appUpdatesEnabled, setAppUpdatesEnabled] = useState(false);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const words = useLanguage();
  const { isDarkTheme } = useTheme();

  const toggleTripAlerts = () => {
    setTripAlertsEnabled(!tripAlertsEnabled);
  };

  const toggleEarningsPayment = () => {
    setEarningsPaymentEnabled(!earningsPaymentEnabled);
  };

  const togglePromotions = () => {
    setPromotionsEnabled(!promotionsEnabled);
  };

  const toggleAppUpdates = () => {
    setAppUpdatesEnabled(!appUpdatesEnabled);
  };

  const toggleSecurityAlerts = () => {
    setSecurityAlertsEnabled(!securityAlertsEnabled);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{words?.Notifications || 'Notifications'}</Text>
      </View>

      {/* Notification Settings List */}
      <View style={[styles.settingsList, { backgroundColor: isDarkTheme && "#1E293B", paddingVertical: 10 }]}>
        <View style={[styles.settingItem, { borderBottomColor: isDarkTheme && "#0f172a" }]}>
          <Text style={[styles.settingLabel, { color: isDarkTheme && "#fff" }]}>{words?.Trip_alerts || 'Trip alerts'}</Text>
          <Switch
            trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTripAlerts}
            value={tripAlertsEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDarkTheme && "#0f172a" }]}>
          <Text style={[styles.settingLabel, { color: isDarkTheme && "#fff" }]}>{words?.Earnings_payment || 'Earnings & payment'}</Text>
          <Switch
            trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleEarningsPayment}
            value={earningsPaymentEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDarkTheme && "#0f172a" }]}>
          <Text style={[styles.settingLabel, { color: isDarkTheme && "#fff" }]}>{words?.Promotions || 'Promotions'}</Text>
          <Switch
            trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={togglePromotions}
            value={promotionsEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: isDarkTheme && "#0f172a" }]}>
          <Text style={[styles.settingLabel, { color: isDarkTheme && "#fff" }]}>{words?.App_updates || 'App updates'}</Text>
          <Switch
            trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleAppUpdates}
            value={appUpdatesEnabled}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
          <Text style={[styles.settingLabel, { color: isDarkTheme && "#fff" }]}>{words?.Security_alerts || 'Security alerts'}</Text>
          <Switch
            trackColor={{ false: '#D1D5DB', true: '#2ECC71' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSecurityAlerts}
            value={securityAlertsEnabled}
          />
        </View>
      </View>
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
    paddingBottom: 15,
    paddingVertical: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
  },
  settingsList: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom:10,
    paddingBottom:10
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default NotificationSettings;