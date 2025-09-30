import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import userImg from '../../assets/images/home/user.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import axios from 'axios';
import config from '../../config';
import Toast from 'react-native-toast-message';

const translations = {
  English: {
    Pre_booked: 'Pre-booked',
    Cash: 'Cash',
    LiqPay: 'LiqPay',
    Pickup: 'Pickup',
    Dropoff: 'Dropoff',
    Distance: 'Distance',
    Date: 'Date',
    Time: 'Time',
  },
  Russian: {
    Pre_booked: 'Предзаказано',
    Cash: 'Наличные',
    LiqPay: 'LiqPay',
    Pickup: 'Забрать',
    Dropoff: 'Доставить',
    Distance: 'Расстояние',
    Date: 'Дата',
    Time: 'Время',
  },
  Ukrainian: {
    Pre_booked: 'Попередньо замовлено',
    Cash: 'Готівка',
    LiqPay: 'LiqPay',
    Pickup: 'Забрати',
    Dropoff: 'Доставити',
    Distance: 'Відстань',
    Date: 'Дата',
    Time: 'Час',
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

const Prebooked = () => {
  const { isDarkTheme } = useTheme();
  const words = useLanguage();
  const navigation = useNavigation();
  const [preBookedRides, setPreBookedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPreBookedRides();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPreBookedRides();
    }, [])
  );

  const fetchPreBookedRides = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      // Use /trip/scheduled as primary endpoint
      console.log('📟 Using /trip/scheduled endpoint...');
      const response = await axios.get(`${config.baseUrl}/trip/scheduled`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response?.data?.status === 200 || response?.status === 200) {
        // Handle different response structures from /trip/scheduled
        const responseData = response.data?.data || response.data;
        const trips = responseData?.trips || responseData?.results || responseData || [];
        const list = Array.isArray(trips) ? trips : [];
        setPreBookedRides(list);
        
        console.log('✅ Pre-booked rides fetched:', list.length);
        console.log('📄 Response structure:', Object.keys(responseData || {}));
      } else {
        setPreBookedRides([]);
        console.log('⚠️ Non-200 response:', response?.data?.status || response?.status);
      }
    } catch (error) {
      console.error('❌ Error fetching pre-booked rides:', error);
      // Gracefully handle 404 and 500 errors by setting empty array
      if (error?.response?.status === 404) {
        setPreBookedRides([]);
        console.log('🚧 404 - Endpoint not found, showing empty state');
      } else if (error?.response?.status === 500) {
        setPreBookedRides([]);
        console.log('🚧 500 - Server error, showing empty state');
        console.log('🔍 Server response:', error?.response?.data);
      } else {
        setPreBookedRides([]);
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to load pre-booked rides',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchPreBookedRides(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.warn('Error formatting time:', error);
      return 'N/A';
    }
  };

  // Safe text rendering function
  const safeText = (value, fallback = 'N/A') => {
    try {
      if (value === null || value === undefined) return fallback;
      return String(value);
    } catch (error) {
      console.warn('Error converting to string:', error);
      return fallback;
    }
  };

  // Ensure array before render to prevent crashes
  const prebookList = React.useMemo(() => {
    try {
      if (!Array.isArray(preBookedRides)) {
        console.log('⚠️ preBookedRides is not an array:', typeof preBookedRides);
        return [];
      }
      
      const filtered = preBookedRides.filter(ride => {
        if (!ride || typeof ride !== 'object') {
          console.log('⚠️ Invalid ride object:', ride);
          return false;
        }
        return true;
      });
      
      console.log('✅ Filtered prebookList:', filtered.length, 'rides');
      return filtered;
    } catch (error) {
      console.error('❌ Error processing prebookList:', error);
      return [];
    }
  }, [preBookedRides]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{words?.Pre_booked || 'Pre-booked'}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={[styles.loadingText, { color: isDarkTheme ? "#fff" : "#333" }]}>
            Loading pre-booked rides...
          </Text>
        </View>
      </View>
    );
  }
  // Render with error boundary
  const renderContent = () => {
    try {
      return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{safeText(words?.Pre_booked, 'Pre-booked')}</Text>
            <View style={{ width: 24 }} />
          </View>

      {/* Pre-booked Rides List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2ECC71']} />
        }
      >
        {prebookList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#94a3b8" />
            <Text style={[styles.emptyText, { color: isDarkTheme ? "#fff" : "#333" }]}>
              {safeText('No pre-booked rides')}
            </Text>
            <Text style={styles.emptySubtext}>
              {safeText('Your scheduled rides will appear here')}
            </Text>
          </View>
        ) : (
          prebookList.map((ride, index) => {
            // Debug log to see what's causing the issue
            console.log('🔍 Rendering ride:', index, {
              customerId: ride.customerId?.fullName,
              paymentMethod: ride.paymentMethod,
              fare: ride.fare,
              distance: ride.distance,
              scheduledTime: ride.scheduledTime
            });
            
            // Safety check - skip if ride is null/undefined
            if (!ride) {
              console.warn('⚠️ Skipping null/undefined ride at index:', index);
              return null;
            }
            
            return (
          <View key={`ride-${index}-${ride._id || index}`} style={[styles.rideCard, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
            {/* Driver Info */}
            <View style={styles.driverInfo}>
              <Image 
                source={ride.customerId?.profileImage ? { uri: ride.customerId.profileImage } : userImg} 
                style={styles.driverImage} 
              />
              <View>
                <Text style={[styles.driverName, { color: isDarkTheme ? "#fff" : "#333" }]}>
                  {safeText(ride.customerId?.fullName, 'Customer')}
                </Text>
                <Text style={[styles.paymentMethod, { color: isDarkTheme ? "#fff" : "#777" }]}>
                  {safeText(ride.paymentMethod, 'Cash')}
                </Text>
              </View>
              <Text style={[styles.price, { color: isDarkTheme ? "#fff" : "#333" }]}>
                ₴{safeText(ride.fare?.totalFare || ride.fare, '0.00')}
              </Text>
            </View>

            {/* Location Details */}
            <View style={styles.locationDetails}>
              {/* Pickup */}
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <View style={styles.pickupDot} />
                  <View style={styles.verticalLine} />
                </View>
                <View>
                  <Text style={[styles.locationName, { color: isDarkTheme ? "#fff" : "#333" }]}>{safeText(words?.Pickup, 'Pickup')}</Text>
                  <Text style={styles.locationAddress}>{safeText(ride.pickupLocation?.address, 'Pickup location')}</Text>
                </View>
              </View>

              {/* Dropoff */}
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color="#2ECC71" />
                </View>
                <View>
                  <Text style={[styles.locationName, { color: isDarkTheme ? "#fff" : "#333" }]}>{safeText(words?.Dropoff, 'Dropoff')}</Text>
                  <Text style={styles.locationAddress}>{safeText(ride.destination?.address, 'Dropoff location')}</Text>
                </View>
              </View>
            </View>

            {/* Ride Summary */}
            <View style={styles.rideSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="location-outline" size={16} color="#777" />
                <Text style={[styles.summaryText, { color: isDarkTheme ? "#fff" : "#777" }]}>
                  {ride.distance ? `${safeText(ride.distance)} km` : 'N/A'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="calendar-outline" size={16} color="#777" />
                <Text style={[styles.summaryText, { color: isDarkTheme ? "#fff" : "#777" }]}>
                  {`${safeText(words?.Date, 'Date')}: ${ride.scheduledTime ? safeText(formatDate(ride.scheduledTime)) : 'N/A'}`}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="time-outline" size={16} color="#777" />
                <Text style={[styles.summaryText, { color: isDarkTheme ? "#fff" : "#777" }]}>
                  {`${safeText(words?.Time, 'Time')}: ${ride.scheduledTime ? safeText(formatTime(ride.scheduledTime)) : 'N/A'}`}
                </Text>
              </View>
            </View>

            {index < prebookList.length - 1 && (
              <View style={styles.separator}>
                <Ionicons name="chevron-down-outline" size={20} color="#777" />
              </View>
            )}
          </View>
            );
          })
        )}
      </ScrollView>
        </View>
      );
    } catch (error) {
      console.error('❌ Render error in PreBookedScreen:', error);
      return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pre-booked</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text style={[styles.emptyText, { color: isDarkTheme ? "#fff" : "#333" }]}>
              Error loading rides
            </Text>
            <Text style={styles.emptySubtext}>
              Please try refreshing the page
            </Text>
          </View>
        </View>
      );
    }
  };

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#2ECC71',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollContainer: {
    padding: 20,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  driverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#777',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  locationDetails: {
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIcon: {
    width: 30,
    alignItems: 'center',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
  },
  verticalLine: {
    height: 20,
    width: 1,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  locationName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  locationAddress: {
    fontSize: 12,
    color: '#777',
  },
  rideSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 5,
  },
  separator: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});

export default Prebooked;