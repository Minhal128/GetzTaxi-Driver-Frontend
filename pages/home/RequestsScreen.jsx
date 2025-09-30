import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import userImg from '../../assets/images/home/user.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

const translations = {
  English: {
    Your_requests: 'Your requests',
    Ignore: 'Ignore',
    Accept: 'Accept',
    Pick_up: 'Pick up',
    Drop_off: 'Drop off',
  },
  Russian: {
    Your_requests: 'Ваши запросы',
    Ignore: 'Игнорировать',
    Accept: 'Принять',
    Pick_up: 'Забрать',
    Drop_off: 'Высадить',
  },
  Ukrainian: {
    Your_requests: 'Ваші запити',
    Ignore: 'Ігнорувати',
    Accept: 'Прийняти',
    Pick_up: 'Забрати',
    Drop_off: 'Висадити',
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

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'accepted': return '#3B82F6';
    case 'driver_arrived': return '#F59E0B';
    case 'in_progress': return '#10B981';
    default: return '#6B7280';
  }
};

const Requests = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  
  // State for trip requests
  const [tripRequests, setTripRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch driver-specific trip requests
  const fetchDriverRequests = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      const response = await axios.get(`${config.baseUrl}/trip/driver/requests`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        setTripRequests(response.data.data || []);
        console.log('✅ Fetched', response.data.count, 'driver requests');
      }

    } catch (error) {
      console.error('❌ Error fetching driver requests:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load requests',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Navigate to trip details/accept screen
  const handleViewTrip = (trip) => {
    navigation.navigate('TripAccept', { tripData: trip });
  };

  // Start navigation to customer
  const handleStartNavigation = async (tripId) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      const response = await axios.put(`${config.baseUrl}/trip/${tripId}/start-navigation`, {
        driverLocation: {
          latitude: 40.7128, // You should get actual driver location
          longitude: -74.0060
        }
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        Toast.show({ type: 'success', text1: 'Navigation started!' });
        navigation.navigate('TripNavigation', { tripData: response.data.data });
      }

    } catch (error) {
      console.error('❌ Error starting navigation:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to start navigation',
        text2: error.response?.data?.msg || error.message
      });
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDriverRequests();
  };

  // Fetch requests on component mount and focus
  useEffect(() => {
    fetchDriverRequests();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDriverRequests();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#1e293b" : '#F8FAFC' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#2ECC71', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }}>{words?.Your_requests || 'Your requests'}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingTop: 15 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && tripRequests.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: isDarkTheme ? "#fff" : "#333", fontSize: 16 }}>Loading requests...</Text>
          </View>
        ) : tripRequests.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="car-outline" size={48} color="#94A3B8" />
            <Text style={{ color: isDarkTheme ? "#fff" : "#333", fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>No Active Requests</Text>
            <Text style={{ color: "#94A3B8", fontSize: 14, textAlign: 'center', marginTop: 5 }}>You don't have any active trip requests at the moment</Text>
          </View>
        ) : (
          tripRequests.map((trip) => (
            <View key={trip._id} style={{ backgroundColor: isDarkTheme ? '#0F172A' : '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }}>
              {/* Trip Status Badge */}
              <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: getStatusColor(trip.status), paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{trip.status.toUpperCase()}</Text>
              </View>

              {/* Customer Info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 10 }}>
                <Image source={userImg} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: isDarkTheme ? "#fff" : '#333', fontSize: 16 }}>{trip.customerName}</Text>
                  <Text style={{ color: '#777', fontSize: 12 }}>{trip.customerPhone}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Feather name="clock" size={12} color="#94A3B8" />
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 4 }}>
                      {new Date(trip.acceptedAt || trip.requestedAt).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontWeight: 'bold', color: '#22C55E', fontSize: 18 }}>₴{trip.fare.totalFare}</Text>
              </View>

              {/* Trip Details */}
              <View style={{ marginBottom: 15 }}>
                {/* Pickup Location */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ backgroundColor: '#22C55E', borderRadius: 100, padding: 6, marginRight: 12, marginTop: 2 }}>
                    <Ionicons name="location" size={14} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#777', fontSize: 12, marginBottom: 2 }}>{words?.Pick_up || 'Pick up'}</Text>
                    <Text style={{ color: isDarkTheme ? "#fff" : '#333', fontSize: 14, fontWeight: '500' }}>
                      {trip.pickupLocation.address}
                    </Text>
                  </View>
                </View>

                {/* Drop-off Location */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ backgroundColor: '#EF4444', borderRadius: 100, padding: 6, marginRight: 12, marginTop: 2 }}>
                    <Ionicons name="flag" size={14} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#777', fontSize: 12, marginBottom: 2 }}>{words?.Drop_off || 'Drop off'}</Text>
                    <Text style={{ color: isDarkTheme ? "#fff" : '#333', fontSize: 14, fontWeight: '500' }}>
                      {trip.destination.address}
                    </Text>
                  </View>
                </View>

                {/* Trip Metrics */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: isDarkTheme ? '#1E293B' : '#F8FAFC', borderRadius: 8, padding: 10, marginTop: 10 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="speedometer-outline" size={16} color="#94A3B8" />
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{trip.distance?.toFixed(1)} km</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={16} color="#94A3B8" />
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{trip.estimatedDuration} min</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="card-outline" size={16} color="#94A3B8" />
                    <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{trip.paymentMethod}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {trip.status === 'accepted' && (
                  <>
                    <TouchableOpacity 
                      onPress={() => handleViewTrip(trip)}
                      style={{ backgroundColor: isDarkTheme ? "#1E293B" : '#E0F7EF', borderRadius: 8, paddingVertical: 12, alignItems: 'center', flex: 1, marginRight: 8 }}
                    >
                      <Text style={{ color: isDarkTheme ? "#fff" : '#22C55E', fontWeight: 'bold', fontSize: 14 }}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleStartNavigation(trip._id)}
                      style={{ backgroundColor: '#22C55E', borderRadius: 8, paddingVertical: 12, alignItems: 'center', flex: 1 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Start Navigation</Text>
                    </TouchableOpacity>
                  </>
                )}
                {trip.status === 'driver_arrived' && (
                  <TouchableOpacity 
                    onPress={() => handleStartNavigation(trip._id)}
                    style={{ backgroundColor: '#22C55E', borderRadius: 8, paddingVertical: 12, alignItems: 'center', flex: 1 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Start Trip</Text>
                  </TouchableOpacity>
                )}
                {trip.status === 'in_progress' && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('TripCompletion', { tripData: trip })}
                    style={{ backgroundColor: '#F59E0B', borderRadius: 8, paddingVertical: 12, alignItems: 'center', flex: 1 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>Complete Trip</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Requests;