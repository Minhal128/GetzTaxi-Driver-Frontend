import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';

const translations = {
  English: {
    Settings: 'Settings',
    Language: 'Language',
    Edit_your_profile_details: 'Change app language',
    Security: 'Security',
    Account_security_change_password: 'Account security, change password',
    Payout_preferences: 'Payout preferences',
    Track_your_completed_ongoing_trips: 'Track your completed, ongoing trips',
  },
  Russian: {
    Settings: 'Настройки',
    Language: 'Язык',
    Edit_your_profile_details: 'Редактировать детали профиля',
    Security: 'Безопасность',
    Account_security_change_password: 'Безопасность аккаунта, смена пароля',
    Payout_preferences: 'Настройки выплат',
    Track_your_completed_ongoing_trips: 'Отслеживайте завершенные и текущие поездки',
  },
  Ukrainian: {
    Settings: 'Налаштування',
    Language: 'Мова',
    Edit_your_profile_details: 'Редагувати дані профілю',
    Security: 'Безпека',
    Account_security_change_password: 'Безпека облікового запису, зміна пароля',
    Payout_preferences: 'Налаштування виплат',
    Track_your_completed_ongoing_trips: 'Відстежуйте завершені та поточні поїздки',
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

const Settings = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const settingsOptions = [
    {
      icon: 'globe-outline',
      title: words?.Language || 'Language',
      subtitle: words?.Edit_your_profile_details || 'Edit your profile details',
      onPress: () => navigation.navigate('home/language'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: words?.Security || 'Security',
      subtitle: words?.Account_security_change_password || 'Account security, change password',
      onPress: () => console.log('Security Settings'),
    },
    {
      icon: 'wallet-outline',
      title: words?.Payout_preferences || 'Payout preferences',
      subtitle: words?.Track_your_completed_ongoing_trips || 'Track your completed, ongoing trips',
      onPress: () => console.log('Payout Preferences'),
    },
    // Add more settings options here
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{words?.Settings || 'Settings'}</Text>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity key={index} onPress={option.onPress} style={[styles.optionItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: isDarkTheme ? "#0f172a" : '#E0F7EF' }]}>
                <Ionicons name={option.icon} size={24} color="#2ECC71" />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: isDarkTheme && "#fff" }]}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#777" />
          </TouchableOpacity>
        ))}
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
    paddingTop: 50,
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
  settingsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  optionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    borderRadius: 8,
    padding: 8,
    marginRight: 15,
  },
  optionTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  optionSubtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
    maxWidth:"90%",
    minWidth:"90%",
  },
});

export default Settings;