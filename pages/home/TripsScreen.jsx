import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import BottomNavbar from '../../components/BottomNavbar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import userImg from '../../assets/images/home/user.png';
import mapImg from '../../assets/images/home/map.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

const translations = {
  English: {
    Bookings: 'Bookings',
    Active: 'Active',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    Ride: 'Ride',
    Delivery: 'Delivery',
    Daniel_Jack: 'Daniel Jack',
    AD65GEJKFK: 'AD65GEJKFK',
    Fashion_Store: 'Fashion Store',
    Home: 'Home',
    Km: ' Km',
    March: ' March, ',
    Mins: ' mins',
    Cancel: 'Cancel',
    Submit: 'Submit',
  },
  Russian: {
    Bookings: 'Заказы',
    Active: 'Активные',
    Completed: 'Завершенные',
    Cancelled: 'Отмененные',
    Ride: 'Поездка',
    Delivery: 'Доставка',
    Daniel_Jack: 'Даниэль Джек',
    AD65GEJKFK: 'AD65GEJKFK',
    Fashion_Store: 'Магазин моды',
    Home: 'Дом',
    Km: ' Км',
    March: ' Марта, ',
    Mins: ' мин',
    Cancel: 'Отменить',
    Submit: 'Подтвердить',
  },
  Ukrainian: {
    Bookings: 'Замовлення',
    Active: 'Активні',
    Completed: 'Завершені',
    Cancelled: 'Скасовані',
    Ride: 'Поїздка',
    Delivery: 'Доставка',
    Daniel_Jack: 'Даніель Джек',
    AD65GEJKFK: 'AD65GEJKFK',
    Fashion_Store: 'Магазин одягу',
    Home: 'Домівка',
    Km: ' Км',
    March: ' Березня, ',
    Mins: ' хв',
    Cancel: 'Скасувати',
    Submit: 'Підтвердити',
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

const Bookings = () => {
  const words = useLanguage();
  const [selectedService, setSelectedService] = useState('Ride');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(isDarkTheme);

  // State for trips data
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch trips from backend
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      const response = await axios.get(`${config.baseUrl}/trip/history/user`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        setTrips(response.data.data || []);
        console.log('✅ Fetched', response.data.count, 'trips');
      }

    } catch (error) {
      console.error('❌ Error fetching trips:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load trips',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter trips based on selected status and service
  const getFilteredTrips = () => {
    let filtered = trips;

    // Filter by status
    switch (selectedStatus) {
      case 'Active':
        filtered = filtered.filter(trip => 
          ['accepted', 'driver_arrived', 'in_progress'].includes(trip.status)
        );
        break;
      case 'Completed':
        filtered = filtered.filter(trip => trip.status === 'completed');
        break;
      case 'Cancelled':
        filtered = filtered.filter(trip => trip.status === 'cancelled');
        break;
    }

    // Filter by service type
    filtered = filtered.filter(trip => 
      trip.tripType === selectedService.toLowerCase()
    );

    return filtered;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#3B82F6';
      case 'driver_arrived': return '#F59E0B';
      case 'in_progress': return '#10B981';
      case 'completed': return '#22C55E';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'driver_arrived': return 'Driver Arrived';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Handle trip action
  const handleTripAction = (trip) => {
    switch (trip.status) {
      case 'accepted':
        navigation.navigate('home/map', { tripData: trip });
        break;
      case 'driver_arrived':
      case 'in_progress':
        navigation.navigate('home/map', { tripData: trip });
        break;
      case 'completed':
        navigation.navigate('home/receipt', { tripData: trip });
        break;
      default:
        navigation.navigate('home/receipt', { tripData: trip });
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const handleServiceToggle = (service) => {
    setSelectedService(service);
  };

  const handleStatusToggle = (status) => {
    setSelectedStatus(status);
  };

  // Fetch trips on component mount and focus
  useEffect(() => {
    fetchTrips();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const filteredTrips = getFilteredTrips();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{words?.Bookings || 'Bookings'}</Text>
      </View>

      {/* Status Toggle */}
      <View style={styles.toggleGroup}>
        {['Active', 'Completed', 'Cancelled'].map((status) => (
          <TouchableOpacity key={status} style={[styles.statusToggleButton, selectedStatus === status && styles.statusToggleActive,]} onPress={() => handleStatusToggle(status)}>
            <Text numberOfLines={1} style={[styles.statusToggleText, selectedStatus === status && styles.statusToggleActiveText,]}>{words?.[status] || status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ride/Delivery Toggle */}
      <View style={styles.toggleGroup}>
        {['Ride', 'Delivery'].map((service) => (
          <TouchableOpacity key={service} style={[styles.toggleButton, selectedService === service && styles.toggleActive,]} onPress={() => handleServiceToggle(service)}>
            <Text numberOfLines={1} style={[styles.toggleText, selectedService === service && styles.toggleActiveText,]}>{words?.[service] || service}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trips List */}
      <ScrollView 
        style={styles.tripsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDarkTheme ? "#fff" : "#333" }]}>Loading trips...</Text>
          </View>
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={selectedStatus === 'Active' ? "car-outline" : selectedStatus === 'Completed' ? "checkmark-circle-outline" : "close-circle-outline"} 
              size={48} 
              color="#94A3B8" 
            />
            <Text style={[styles.emptyTitle, { color: isDarkTheme ? "#fff" : "#333" }]}>
              No {selectedStatus} {selectedService}s
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'Active' 
                ? `You don't have any active ${selectedService.toLowerCase()} trips at the moment`
                : selectedStatus === 'Completed'
                ? `No completed ${selectedService.toLowerCase()} trips found`
                : `No cancelled ${selectedService.toLowerCase()} trips found`
              }
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip) => (
            <TouchableOpacity 
              key={trip._id} 
              onPress={() => handleTripAction(trip)} 
              style={[styles.bookingCard, { backgroundColor: isDarkTheme ? '#0F172A' : '#fff' }]}
            >
              {/* Trip Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
                <Text style={styles.statusBadgeText}>{getStatusText(trip.status)}</Text>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Image source={userImg} style={styles.userImage} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: isDarkTheme ? "#fff" : "#333" }]}>
                    {trip.customerName}
                  </Text>
                  <Text style={styles.userId}>{trip.customerPhone}</Text>
                  <Text style={[styles.tripDate, { color: "#94A3B8" }]}>
                    {new Date(trip.createdAt).toLocaleDateString()} | {new Date(trip.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={[styles.bookingAmount, { color: isDarkTheme ? "#fff" : "#333" }]}>
                  ₴{trip.fare?.totalFare || '0.00'}
                </Text>
              </View>

              {/* Trip Details */}
              <View style={styles.tripDetails}>
                <View style={styles.locationPoint}>
                  <View style={[styles.circle, styles.startCircle]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.locationName, { color: isDarkTheme ? "#fff" : "#333" }]}>
                      Pickup Location
                    </Text>
                    <Text style={styles.locationAddress}>
                      {trip.pickupLocation?.address || 'Address not available'}
                    </Text>
                  </View>
                </View>
                <View style={styles.line} />
                <View style={styles.locationPoint}>
                  <View style={[styles.circle, styles.endCircle]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.locationName, { color: isDarkTheme ? "#fff" : "#333" }]}>
                      Destination
                    </Text>
                    <Text style={styles.locationAddress}>
                      {trip.destination?.address || 'Address not available'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.additionalInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color={isDarkTheme ? "#ccc" : "#777"} />
                  <Text style={styles.infoText}>{trip.distance?.toFixed(1) || '0'}{words?.Km || ' Km'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Feather name="clock" size={16} color={isDarkTheme ? "#ccc" : "#777"} />
                  <Text style={styles.infoText}>{trip.estimatedDuration || '0'}{words?.Mins || ' mins'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="card-outline" size={16} color={isDarkTheme ? "#ccc" : "#777"} />
                  <Text style={styles.infoText}>{trip.paymentMethod || 'Cash'}</Text>
                </View>
              </View>

              {/* Trip Actions */}
              {selectedStatus === 'Active' && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                  {trip.status === 'accepted' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: isDarkTheme ? '#1C3A33' : '#E0F7EF' }]}
                        onPress={() => navigation.navigate('home/map', { tripData: trip })}
                      >
                        <Text style={{ color: '#22C55E', fontSize: 14 }}>Start Navigation</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#22C55E' }]}
                        onPress={() => handleTripAction(trip)}
                      >
                        <Text style={{ color: 'white', fontSize: 14 }}>View Details</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {trip.status === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#F59E0B', flex: 1 }]}
                      onPress={() => navigation.navigate('home/payment', { tripData: trip })}
                    >
                      <Text style={{ color: 'white', fontSize: 14 }}>Complete Trip</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <BottomNavbar />
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e293b' : '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      backgroundColor: '#2ECC71',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    toggleGroup: {
      flexDirection: 'row',
      borderRadius: 5,
      marginBottom: 15,
      backgroundColor: isDark ? '#1e293b' : '#f0f0f0',
      padding: 5,
      marginHorizontal: 20,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 5,
    },
    toggleActive: {
      backgroundColor: isDark ? '#2ECC71' : '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleText: {
      color: isDark ? '#bbb' : '#777',
    },
    toggleActiveText: {
      color: isDark ? '#fff' : '#27AE60',
      fontWeight: 'bold',
    },
    statusToggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 5,
      marginRight: 5,
    },
    statusToggleActive: {
      backgroundColor: '#27AE60',
    },
    statusToggleText: {
      color: isDark ? '#aaa' : '#777',
      fontSize: 12
    },
    statusToggleActiveText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    // New styles for trips list
    tripsContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: '#94A3B8',
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    statusBadge: {
      position: 'absolute',
      top: 15,
      right: 15,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 1,
    },
    statusBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    tripDate: {
      fontSize: 12,
      marginTop: 2,
    },
    actionButton: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 4,
    },
    bookingCard: {
      backgroundColor: isDark ? '#0f172a' : '#fff',
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
      marginHorizontal: 20,
      marginTop: 40,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    userImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    userName: {
      fontWeight: 'bold',
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    userId: {
      color: isDark ? '#ccc' : '#777',
      fontSize: 12,
    },
    bookingAmount: {
      fontWeight: 'bold',
      fontSize: 18,
      marginLeft: 'auto',
      color: isDark ? '#fff' : '#000',
    },
    tripDetails: {
      marginBottom: 15,
    },
    locationPoint: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    circle: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 10,
    },
    startCircle: {
      backgroundColor: '#27AE60',
    },
    endCircle: {
      backgroundColor: '#27AE60',
    },
    locationName: {
      fontWeight: 'bold',
      fontSize: 14,
      flex: 1,
      color: isDark ? '#fff' : '#000',
    },
    locationAddress: {
      color: isDark ? '#ccc' : '#777',
      fontSize: 12,
      marginLeft: 22,
    },
    line: {
      width: 1,
      backgroundColor: isDark ? '#444' : '#ddd',
      position: 'absolute',
      top: 18,
      left: 5,
      bottom: 18,
    },
    additionalInfo: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#eee',
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText: {
      marginLeft: 5,
      color: isDark ? '#ccc' : '#777',
      fontSize: 12,
    },
  });

export default Bookings;