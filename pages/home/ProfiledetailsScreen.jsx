import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ToastAndroid } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import userImg from '../../assets/images/home/user.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import axios from 'axios';
import config from '../../config';
import * as ImagePicker from 'expo-image-picker';

const translations = {
  English: {
    Profile: 'Profile',
    Full_name: 'Full name',
    Phone_number: 'Phone number',
    Email_address: 'Email address',
    Gender: 'Gender',
    Ratings: 'Ratings',
    Trips: 'Trips',
    Years: 'Years',
    Distance: 'Distance',
  },
  Russian: {
    Profile: 'Профиль',
    Full_name: 'Полное имя',
    Phone_number: 'Номер телефона',
    Email_address: 'Адрес электронной почты',
    Gender: 'Пол',
    Ratings: 'Рейтинг',
    Trips: 'Поездки',
    Years: 'Лет',
    Distance: 'Расстояние',
  },
  Ukrainian: {
    Profile: 'Профіль',
    Full_name: "Повне ім'я",
    Phone_number: 'Номер телефону',
    Email_address: 'Адреса електронної пошти',
    Gender: 'Стать',
    Ratings: 'Рейтинг',
    Trips: 'Поїздки',
    Years: 'Років',
    Distance: 'Відстань',
  },
};

const getTranslations = async (language) => {
  if (translations[language]) return translations[language];
  return translations["English"];
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

const ProfileDetails = () => {
  const { isDarkTheme } = useTheme();
  const words = useLanguage();
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [tripStats, setTripStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from AsyncStorage
      let userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        // Try to get from userProfile stored during login
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          setUserProfile(profileData.data);
          userId = profileData.data?._id;
        }
      }

      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('🔍 Fetching profile for user ID:', userId);
      
      const authToken = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${config.baseUrl}/driver/info/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        console.log('✅ Profile data fetched successfully:', response.data.data);
        setUserProfile(response.data.data);
        
        // Fetch wallet data only (trip stats will come from wallet)
        await fetchWalletData(authToken);
      } else {
        throw new Error(response.data.msg || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError(error.message);
      
      // Fallback to stored profile data
      try {
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          console.log('📱 Using stored profile data as fallback');
          setUserProfile(profileData.data);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  // Refresh profile data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfileInfo();
    }, [])
  );

  const fetchWalletData = async (authToken) => {
    try {
      const response = await axios.get(`${config.baseUrl}/trip/wallet`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        setWalletData(response.data.data.wallet);
        // Use wallet stats as trip stats
        setTripStats({
          totalTrips: response.data.data.wallet.stats?.totalTrips || 0,
          totalDistance: response.data.data.wallet.stats?.totalDistance || 0,
          completedTrips: response.data.data.wallet.stats?.completedTrips || 0
        });
        console.log('✅ Wallet data fetched:', response.data.data.wallet);
      }
    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
    }
  };


  const handleImagePick = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (file) => {
    try {
      let userId = await AsyncStorage.getItem('user_id');
      console.log(userId, 'userId')
      const form = new FormData();
      form.append('image', {
        uri: file.uri,
        name: file.fileName || 'profile.jpg',
        type: file.mimeType || 'image/jpeg',
      });

      await axios.put(`${config.baseUrl}/driver/upload/${userId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      ToastAndroid.show('Profile image updated!', ToastAndroid.SHORT)
      fetchProfileInfo();
    } catch (err) {
      console.log(err);
      ToastAndroid.show('Failed to upload image', ToastAndroid.SHORT)
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff", justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{words?.Profile || 'Profile'}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="person-circle-outline" size={64} color="#94a3b8" />
          <Text style={{ color: isDarkTheme ? "#fff" : "#333", marginTop: 16, fontSize: 16 }}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{words?.Profile || 'Profile'}</Text>
      </View>

      {/* Error State */}
      {error && !userProfile && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={{ color: "#EF4444", marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity 
            onPress={fetchProfileInfo}
            style={{ 
              backgroundColor: '#2ECC71', 
              paddingHorizontal: 20, 
              paddingVertical: 10, 
              borderRadius: 8, 
              marginTop: 16 
            }}
          >
            <Text style={{ color: '#fff' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Info */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={userProfile?.profileImage ? { uri: userProfile.profileImage } : userImg}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon} onPress={handleImagePick}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: isDarkTheme && "#fff" }]}>
          {userProfile?.fullName || 'Driver Name'}
        </Text>
        <Text style={styles.role}>
          {userProfile?.role === 'driver' ? 'Driver' : userProfile?.role || 'Driver'}
        </Text>
        <Text style={[styles.location, { color: isDarkTheme ? "#94a3b8" : "#777" }]}>
          {userProfile?.city && userProfile?.country 
            ? `${userProfile.city}, ${userProfile.country}` 
            : 'Location not set'
          }
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconBg}>
              <Ionicons name="star" size={20} color="#2ECC71" />
            </View>
            <Text style={[styles.statValue, { color: isDarkTheme && "#fff" }]}>
              {userProfile?.ratings || '5.0'}
            </Text>
            <Text style={styles.statLabel}>{words?.Ratings || 'Ratings'}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconBg}>
              <Ionicons name="car-outline" size={20} color="#2ECC71" />
            </View>
            <Text style={[styles.statValue, { color: isDarkTheme && "#fff" }]}>
              {tripStats?.totalTrips || '0'}
            </Text>
            <Text style={styles.statLabel}>{words?.Trips || 'Trips'}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconBg}>
              <Ionicons name="timer-outline" size={20} color="#2ECC71" />
            </View>
            <Text style={[styles.statValue, { color: isDarkTheme && "#fff" }]}>
              {userProfile?.createdAt ? 
                Math.floor((new Date() - new Date(userProfile.createdAt)) / (1000 * 60 * 60 * 24 * 365)) || '0' 
                : '0'}
            </Text>
            <Text style={styles.statLabel}>{words?.Years || 'Years'}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconBg}>
              <Ionicons name="location-outline" size={20} color="#2ECC71" />
            </View>
            <Text style={[styles.statValue, { color: isDarkTheme && "#fff" }]}>
              {tripStats?.totalDistance ? `${tripStats.totalDistance.toFixed(0)}km` : '0km'}
            </Text>
            <Text style={styles.statLabel}>{words?.Distance || 'Distance'}</Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <ScrollView contentContainerStyle={[styles.detailsSection, { backgroundColor: isDarkTheme && "#1E293B", paddingHorizontal: 10 }]}>
        <TouchableOpacity style={styles.detailItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
              {userProfile?.fullName || 'Not set'}
            </Text>
            <Text style={styles.detailSublabel}>{words?.Full_name || 'Full name'}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#777" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.detailItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
              {userProfile?.phoneNumber || 'Not set'}
            </Text>
            <Text style={styles.detailSublabel}>{words?.Phone_number || 'Phone number'}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#777" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.detailItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
              {userProfile?.email || 'Not set'}
            </Text>
            <Text style={styles.detailSublabel}>{words?.Email_address || 'Email address'}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#777" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.detailItem}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
              {userProfile?.gender || 'Not set'}
            </Text>
            <Text style={styles.detailSublabel}>{words?.Gender || 'Gender'}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#777" />
        </TouchableOpacity>

        {/* Vehicle Information */}
        {userProfile?.vehicle && (
          <TouchableOpacity style={styles.detailItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
                {`${userProfile.vehicle.color} ${userProfile.vehicle.maker}`}
              </Text>
              <Text style={styles.detailSublabel}>Vehicle</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#777" />
          </TouchableOpacity>
        )}

        {/* Registration Number */}
        {userProfile?.vehicle?.registrationNumber && (
          <TouchableOpacity style={styles.detailItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
                {userProfile.vehicle.registrationNumber}
              </Text>
              <Text style={styles.detailSublabel}>Registration Number</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#777" />
          </TouchableOpacity>
        )}

        {/* Payment Method */}
        {userProfile?.paymentMethod && (
          <TouchableOpacity style={styles.detailItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>
                {userProfile.paymentMethod}
              </Text>
              <Text style={styles.detailSublabel}>Payment Method</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#777" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#2ECC71',
    paddingBottom: 15,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 20 },
  profileInfoContainer: { alignItems: 'center', paddingTop: 20 },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: { fontWeight: 'bold', fontSize: 20, color: '#333', marginTop: 10 },
  role: { color: '#777', fontSize: 14, marginBottom: 5 },
  location: { color: '#777', fontSize: 12, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginBottom: 30 },
  statItem: { alignItems: 'center' },
  statIconBg: { backgroundColor: '#E0F7EF', borderRadius: 15, padding: 10, marginBottom: 5 },
  statValue: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  statLabel: { color: '#777', fontSize: 12 },
  detailsSection: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 10, paddingVertical: 10 },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  detailSublabel: { color: '#777', fontSize: 12, marginTop: 2 },
});

export default ProfileDetails;
