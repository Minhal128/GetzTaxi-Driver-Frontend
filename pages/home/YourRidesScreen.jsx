import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../../config';
import Toast from 'react-native-toast-message';
import { testTripEndpoints } from '../../utils/apiDebugger';

const YourRides = () => {
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [])
  );

  const fetchRides = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      // Use /trip/scheduled as primary endpoint (same as prebooked)
      console.log('📟 Using /trip/scheduled endpoint for rides...');
      const response = await axios.get(`${config.baseUrl}/trip/scheduled`, {
        params: { page: pageNum, limit: 10 },
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
        
        if (pageNum === 1 || isRefresh) {
          setRides(list);
        } else {
          setRides(prev => [...prev, ...list]);
        }
        
        // Handle stats from different response structures
        const stats = responseData?.stats || {};
        setStats(stats);
        
        // Handle pagination from different response structures
        const pagination = responseData?.pagination || {};
        setHasMore(Boolean(pagination?.hasNext) || list.length >= 10);
        setPage(pageNum);
        
        console.log('✅ Rides fetched successfully:', list.length);
        console.log('📄 Response structure:', Object.keys(responseData || {}));
      } else {
        // Non-200 responses - set empty arrays safely
        setRides([]);
        setStats({});
        setHasMore(false);
        console.log('⚠️ Non-200 response:', response?.data?.status || response?.status);
      }
    } catch (error) {
      console.error('❌ Error fetching rides:', error);
      // Gracefully handle 404 and 500 errors by setting empty array
      if (error?.response?.status === 404) {
        setRides([]);
        setStats({});
        setHasMore(false);
        console.log('🚧 404 - Endpoint not found, showing empty state');
      } else if (error?.response?.status === 500) {
        setRides([]);
        setStats({});
        setHasMore(false);
        console.log('🚧 500 - Server error, showing empty state');
        console.log('🔍 Server response:', error?.response?.data);
      } else {
        setRides([]);
        setStats({});
        setHasMore(false);
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to load rides',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchRides(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchRides(page + 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2ECC71';
      case 'cancelled': return '#E74C3C';
      case 'ongoing': return '#F39C12';
      case 'accepted': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      case 'ongoing': return 'time';
      case 'accepted': return 'car';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return `₴${amount?.toFixed(2) || '0.00'}`;
  };

  // Helper to ensure array before rendering to prevent crashes
  const safeRides = Array.isArray(rides) ? rides : [];

  if (loading && rides.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#F8FAFC" }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Rides</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={[styles.loadingText, { color: isDarkTheme ? "#fff" : "#333" }]}>
            Loading your rides...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#F8FAFC" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Rides</Text>
        {__DEV__ && (
          <TouchableOpacity 
            onPress={async () => {
              console.log('🔍 Testing trip endpoints...');
              const result = await testTripEndpoints();
              if (result) {
                Toast.show({
                  type: 'success',
                  text1: 'Found working endpoint!',
                  text2: result.url.split('/').pop()
                });
              }
            }}
            style={{ marginLeft: 10, padding: 5 }}
          >
            <Ionicons name="bug" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
          <Text style={[styles.statNumber, { color: isDarkTheme ? "#fff" : "#333" }]}>
            {stats.totalTrips || 0}
          </Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
          <Text style={[styles.statNumber, { color: isDarkTheme ? "#fff" : "#333" }]}>
            {stats.completedTrips || 0}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
          <Text style={[styles.statNumber, { color: isDarkTheme ? "#fff" : "#333" }]}>
            {formatCurrency(stats.totalEarnings)}
          </Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
      </View>

      {/* Rides List */}
      <ScrollView
        style={styles.ridesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2ECC71']} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {safeRides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#94a3b8" />
            <Text style={[styles.emptyText, { color: isDarkTheme ? "#fff" : "#333" }]}>
              No rides found
            </Text>
            <Text style={styles.emptySubtext}>
              Your completed rides will appear here
            </Text>
          </View>
        ) : (
          safeRides.map((ride, index) => (
            <TouchableOpacity
              key={ride._id}
              style={[styles.rideCard, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}
              onPress={() => navigation.navigate('trip/details', { tripId: ride._id })}
            >
              <View style={styles.rideHeader}>
                <View style={styles.rideInfo}>
                  <Text style={[styles.customerName, { color: isDarkTheme ? "#fff" : "#333" }]}>
                    {ride.customerId?.fullName || 'Unknown Customer'}
                  </Text>
                  <Text style={styles.rideDate}>{formatDate(ride.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) + '20' }]}>
                  <Ionicons 
                    name={getStatusIcon(ride.status)} 
                    size={16} 
                    color={getStatusColor(ride.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.rideDetails}>
                <View style={styles.locationContainer}>
                  <View style={styles.locationItem}>
                    <Ionicons name="radio-button-on" size={12} color="#2ECC71" />
                    <Text style={[styles.locationText, { color: isDarkTheme ? "#cbd5e1" : "#666" }]} numberOfLines={1}>
                      {ride.pickupLocation?.address || 'Pickup location'}
                    </Text>
                  </View>
                  <View style={styles.locationDivider} />
                  <View style={styles.locationItem}>
                    <Ionicons name="location" size={12} color="#E74C3C" />
                    <Text style={[styles.locationText, { color: isDarkTheme ? "#cbd5e1" : "#666" }]} numberOfLines={1}>
                      {ride.dropoffLocation?.address || 'Dropoff location'}
                    </Text>
                  </View>
                </View>

                <View style={styles.rideFooter}>
                  <Text style={[styles.fareText, { color: isDarkTheme ? "#fff" : "#333" }]}>
                    {formatCurrency(ride.fare)}
                  </Text>
                  <Text style={styles.distanceText}>
                    {ride.distance ? `${ride.distance.toFixed(1)} km` : 'N/A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {loading && safeRides.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color="#2ECC71" />
            <Text style={styles.loadMoreText}>Loading more rides...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2ECC71',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
  },
  ridesContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  rideCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rideDate: {
    fontSize: 12,
    color: '#777',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rideDetails: {
    gap: 12,
  },
  locationContainer: {
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  locationDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 6,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceText: {
    fontSize: 12,
    color: '#777',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadMoreText: {
    color: '#777',
    fontSize: 14,
  },
});

export default YourRides;
