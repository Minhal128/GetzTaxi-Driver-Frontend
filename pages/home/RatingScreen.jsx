import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import userImg from '../../assets/images/home/user.png';
import { useTheme } from '../../hooks/themeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/core';


const translations = {
  English: {
    Rate: "Rate",
    HowWasTrip: "How's your trip?",
    RateDriver: "Please rate your driver",
    WriteFeedback: "Write your feedback",
    YourFeedback: "Your feedback...",
    Cancel: "Cancel",
    Submit: "Submit",
  },
  Russian: {
    Rate: "Оценить",
    HowWasTrip: "Как прошла поездка?",
    RateDriver: "Пожалуйста, оцените водителя",
    WriteFeedback: "Напишите свой отзыв",
    YourFeedback: "Ваш отзыв...",
    Cancel: "Отмена",
    Submit: "Отправить",
  },
  Ukrainian: {
    Rate: "Оцінити",
    HowWasTrip: "Як пройшла поїздка?",
    RateDriver: "Будь ласка, оцініть водія",
    WriteFeedback: "Напишіть свій відгук",
    YourFeedback: "Ваш відгук...",
    Cancel: "Скасувати",
    Submit: "Надіслати",
  },
};

const getTranslations = async (language) => {
  try {
    if (translations[language]) {
      return translations[language];
    }
    return translations["English"];
  }
  catch (error) {
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


const Rate = () => {
  const words = useLanguage();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const handleRating = (star) => {
    setRating(star);
  };

  const textColor = isDarkTheme ? '#fff' : '#333';
  const subTextColor = isDarkTheme ? '#ccc' : '#777';
  const borderColor = isDarkTheme ? '#334155' : '#ccc';
  const inputBgColor = isDarkTheme ? '#1E293B' : '#fff';

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#0F172A' : '#fff', padding: 20, paddingTop: 50 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity style={{ marginRight: 15 }} onPress={() => navigation.navigate('home')}>
          <Ionicons name="chevron-back" size={24} color={subTextColor} />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: textColor }}>{words.Rate}</Text>
      </View>

      {/* Driver Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
        <Image source={userImg} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: textColor }}>Daniel Jack</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={16} color="#FFC107" style={{ marginRight: 5 }} />
            <Text style={{ color: subTextColor, marginRight: 5 }}>4.5</Text>
            <Text style={{ color: subTextColor }}>| AD65GEJKFK</Text>
          </View>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#E0F7FA', borderRadius: 10, padding: 8, marginRight: 8 }}>
          <Ionicons name="call-outline" size={24} color="#00ACC1" />
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#E6F9E8', borderRadius: 10, padding: 8 }}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      {/* Rating Section */}
      <View style={{ marginBottom: 25 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: textColor, marginBottom: 10 }}>{words.HowWasTrip}</Text>
        <Text style={{ color: subTextColor, marginBottom: 15 }}>{words.RateDriver}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color="#FFC107"
                style={{ marginHorizontal: 10 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback Section */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: textColor, marginBottom: 10 }}>{words.WriteFeedback}</Text>
        <TextInput
          style={{
            height: 100,
            borderColor: borderColor,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            textAlignVertical: 'top',
            color: textColor,
            backgroundColor: inputBgColor,
          }}
          placeholder={words.YourFeedback}
          placeholderTextColor={subTextColor}
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#E0F7FA',
            borderRadius: 10,
            paddingVertical: 15,
            flex: 1,
            marginRight: 10,
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('home')}
        >
          <Text style={{ color: '#00ACC1', fontWeight: 'bold', fontSize: 16 }}>{words.Cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#2ECC71',
            borderRadius: 10,
            paddingVertical: 15,
            flex: 1,
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('home')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{words.Submit}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Rate;