import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../hooks/themeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/core';

const translations = {
  English: {
    Driver_s_preference: "Driver's preference",
    Accept_cash: 'Accept cash',
    Distance: 'Distance',
    Show_trips_more_than_45_mins: 'Show trips more than 45 mins',
    Short_distance_trips: 'Short distance trips',
    Show_trips_less_than_45_mins: 'Show trips less than 45 mins',
    Price: 'Price',
    Show_trips_less_than_$10: 'Show trips less than ₴10',
    Pickup_time: 'Pickup time',
    Show_trips_starting_12_AM: 'Show trips starting 12 AM',
  },
  Russian: {
    Driver_s_preference: 'Настройки водителя',
    Accept_cash: 'Принимать наличные',
    Distance: 'Расстояние',
    Show_trips_more_than_45_mins: 'Показывать поездки дольше 45 минут',
    Short_distance_trips: 'Поездки на короткие расстояния',
    Show_trips_less_than_45_mins: 'Показывать поездки менее 45 минут',
    Price: 'Цена',
    Show_trips_less_than_$10: 'Показывать поездки дешевле ₴10',
    Pickup_time: 'Время посадки',
    Show_trips_starting_12_AM: 'Показывать поездки, начинающиеся в 12 AM',
  },
  Ukrainian: {
    Driver_s_preference: 'Налаштування водія',
    Accept_cash: 'Приймати готівку',
    Distance: 'Відстань',
    Show_trips_more_than_45_mins: 'Показувати поїздки довше 45 хвилин',
    Short_distance_trips: 'Поїздки на короткі відстані',
    Show_trips_less_than_45_mins: 'Показувати поїздки менше 45 хвилин',
    Price: 'Ціна',
    Show_trips_less_than_$10: 'Показувати поїздки дешевше ₴10',
    Pickup_time: 'Час посадки',
    Show_trips_starting_12_AM: 'Показувати поїздки, що починаються о 12 AM',
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


const Preference = () => {
  const navigation = useNavigation();
  const words = useLanguage();
  const [acceptCash, setAcceptCash] = useState(true);
  const [showLongDistance, setShowLongDistance] = useState(false);
  const [showShortDistance, setShowShortDistance] = useState(true);
  const [showLowPrice, setShowLowPrice] = useState(false);
  const { isDarkTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme && "#0f172a" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{words?.Driver_s_preference || "Driver's preference"}</Text>
      </View>

      {/* Preferences List */}
      <View style={styles.preferenceList}>
        <View style={[styles.preferenceItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
          <View>
            <Text style={[styles.preferenceLabel, { color: isDarkTheme && "#fff" }]}>{words?.Accept_cash || 'Accept cash'}</Text>
          </View>
          <Switch
            value={acceptCash}
            onValueChange={setAcceptCash}
            trackColor={{ false: '#767577', true: '#2ECC71' }}
            thumbColor={acceptCash ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.preferenceItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
          <View>
            <Text style={[styles.preferenceLabel, { color: isDarkTheme && "#fff" }]}>{words?.Distance || 'Distance'}</Text>
            <Text style={styles.preferenceSublabel}>{words?.Show_trips_more_than_45_mins || 'Show trips more than 45 mins'}</Text>
          </View>
          <Switch
            value={showLongDistance}
            onValueChange={setShowLongDistance}
            trackColor={{ false: '#767577', true: '#2ECC71' }}
            thumbColor={showLongDistance ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.preferenceItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
          <View>
            <Text style={[styles.preferenceLabel, { color: isDarkTheme && "#fff" }]}>{words?.Short_distance_trips || 'Short distance trips'}</Text>
            <Text style={styles.preferenceSublabel}>{words?.Show_trips_less_than_45_mins || 'Show trips less than 45 mins'}</Text>
          </View>
          <Switch
            value={showShortDistance}
            onValueChange={setShowShortDistance}
            trackColor={{ false: '#767577', true: '#2ECC71' }}
            thumbColor={showShortDistance ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.preferenceItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
          <View>
            <Text style={[styles.preferenceLabel, { color: isDarkTheme && "#fff" }]}>{words?.Price || 'Price'}</Text>
            <Text style={styles.preferenceSublabel}>{words?.Show_trips_less_than_$10 || 'Show trips less than ₴10'}</Text>
          </View>
          <Switch
            value={showLowPrice}
            onValueChange={setShowLowPrice}
            trackColor={{ false: '#767577', true: '#2ECC71' }}
            thumbColor={showLowPrice ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={[styles.preferenceItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
          <View>
            <Text style={[styles.preferenceLabel, { color: isDarkTheme && "#fff" }]}>{words?.Pickup_time || 'Pickup time'}</Text>
            <Text style={styles.preferenceSublabel}>{words?.Show_trips_starting_12_AM || 'Show trips starting 12 AM'}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#777" />
        </TouchableOpacity>
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
  preferenceList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  preferenceLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  preferenceSublabel: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
});

export default Preference;