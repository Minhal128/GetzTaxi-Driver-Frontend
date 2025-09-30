import React, { useEffect, useState, useRef } from 'react'
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import carImg from '../../assets/images/home/car.png'
import userImg from '../../assets/images/home/user.png'
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useNavigation, useRoute } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MapScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const mapRef = useRef(null);
    
    // Trip data from navigation params
    const tripData = route.params?.tripData;
    
    // State
    const [userlocation, setUserLocation] = useState(null);
    const [nearByDrivers, setNearByDrivers] = useState([]);
    const [isOrderAcceptedModalVisible, setIsOrderAcceptedModalVisible] = useState(true);
    const [onTheWayVisible, setonTheWayVisible] = useState(false)
    const [trackVisible, setTrackVisible] = useState(false)
    const [tripCancelledModel, setTripCancelledModel] = useState(false);
    
    // Trip navigation state
    const [tripStarted, setTripStarted] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [distance, setDistance] = useState('');

    const [deliveryDetails] = useState({
        estimatedTime: tripData?.estimatedDuration ? `${tripData.estimatedDuration} mins` : '19:50 mins',
        pickupLocation: tripData?.pickupLocation?.address || 'Malware Junction',
        dropoffLocation: tripData?.destination?.address || '23, Round Town Avenue',
    });

    const userLocation = async () => {
        try {
            // Request location permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
                return;
            }

            // Get current location
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 15000,
                maximumAge: 10000,
            });

            const { latitude, longitude } = location.coords;
            setUserLocation({ latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
            
            const generatedDrivers = Array.from({ length: 5 }).map((_, index) => ({
                id: index,
                latitude: latitude + (Math.random() * 0.02 - 0.01),
                longitude: longitude + (Math.random() * 0.02 - 0.01),
            }));

            setNearByDrivers(generatedDrivers);
        } catch (err) {
            console.error('Error getting location:', err);
        }
    };

    // Start trip navigation
    const startTripNavigation = async () => {
        try {
            if (!tripData) {
                Toast.show({ type: 'error', text1: 'No trip data available' });
                return;
            }

            const authToken = await AsyncStorage.getItem('authToken');
            const response = await axios.put(`${config.baseUrl}/trip/${tripData._id}/start-navigation`, {
                driverLocation: userlocation
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                setTripStarted(true);
                Toast.show({ type: 'success', text1: 'Trip navigation started!' });
                
                // Get directions from current location to pickup
                getDirections(userlocation, tripData.pickupLocation.coordinates);
                
                // Start location tracking
                startLocationTracking();
            }

        } catch (error) {
            console.error('❌ Error starting trip navigation:', error);
            Toast.show({ type: 'error', text1: 'Failed to start navigation' });
        }
    };

    // Get directions between two points
    const getDirections = async (origin, destination) => {
        try {
            const originStr = `${origin.latitude},${origin.longitude}`;
            const destinationStr = `${destination.latitude},${destination.longitude}`;
            
            // Using Google Directions API (you'll need to add your API key)
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${config.key1}`
            );
            
            const data = await response.json();
            
            if (data.routes.length > 0) {
                const route = data.routes[0];
                const points = decode(route.overview_polyline.points);
                setRouteCoordinates(points);
                setEstimatedTime(route.legs[0].duration.text);
                setDistance(route.legs[0].distance.text);
                
                // Fit map to show entire route
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates(points, {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        animated: true,
                    });
                }
            }
        } catch (error) {
            console.error('Error getting directions:', error);
        }
    };

    // Decode polyline points
    const decode = (encoded) => {
        const points = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }
        return points;
    };

    // Start real-time location tracking
    const startLocationTracking = () => {
        const locationSubscription = Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000, // Update every 5 seconds
                distanceInterval: 10, // Update every 10 meters
            },
            (location) => {
                const { latitude, longitude } = location.coords;
                setUserLocation({ latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
                
                // Update driver location on backend
                updateDriverLocation(latitude, longitude);
            }
        );

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    };

    // Update driver location on backend
    const updateDriverLocation = async (latitude, longitude) => {
        try {
            if (!tripData) return;

            const authToken = await AsyncStorage.getItem('authToken');
            await axios.put(`${config.baseUrl}/trip/${tripData._id}/location`, {
                latitude,
                longitude
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            console.error('Error updating driver location:', error);
        }
    };

    // Complete trip and navigate to payment
    const completeTrip = () => {
        navigation.navigate('home/payment', { 
            tripData: tripData,
            actualDistance: distance,
            actualDuration: estimatedTime
        });
    };

    useEffect(() => {
        userLocation();
        
        // If trip data exists, show trip-specific UI
        if (tripData) {
            setIsOrderAcceptedModalVisible(false);
            setTrackVisible(true);
        }
    }, []);

    useEffect(() => {
        if (tripData && userlocation) {
            // Auto-start navigation if trip is in progress
            if (tripData.status === 'in_progress') {
                startTripNavigation();
            }
        }
    }, [tripData, userlocation]);


    return (

        <View style={{ flex: 1, backgroundColor: "#fff" }}>


            <View style={{ flex: 1, position: "relative" }}>


                {/* TOPBAR  */}
                <View style={{ position: "absolute", top: 50, left: 0, right: 0, justifyContent: "flex-end", alignItems: "center", flexDirection: "row", gap: 10, paddingHorizontal: 20, zIndex: 100 }}>

                    <TouchableOpacity onPress={() => navigation.navigate("home/search")} style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: "#fff" }}>
                        <EvilIcons name="search" size={24} color="black" style={{ marginTop: -5 }} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("home/notification")} style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: "#fff" }}>
                        <EvilIcons name="bell" size={24} color="black" style={{ marginTop: -5 }} />
                    </TouchableOpacity>

                </View>

                {/* MAP */}
                <MapView 
                    ref={mapRef}
                    style={{ width: '100%', height: '100%' }} 
                    region={userlocation || { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }} 
                    showsUserLocation 
                    showsMyLocationButton={false}
                >
                    {/* Driver Location */}
                    <Marker coordinate={userlocation || { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}>
                        <View style={{ alignItems: 'center' }}>
                            <Image source={carImg} style={{ width: 30, height: 30 }} />
                        </View>
                    </Marker>

                    {/* Pickup Location */}
                    {tripData && (
                        <Marker 
                            coordinate={tripData.pickupLocation.coordinates}
                            title="Pickup Location"
                            description={tripData.pickupLocation.address}
                        >
                            <View style={{ alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#22C55E', borderRadius: 20, padding: 8 }}>
                                    <Ionicons name="location" size={20} color="#fff" />
                                </View>
                            </View>
                        </Marker>
                    )}

                    {/* Destination */}
                    {tripData && (
                        <Marker 
                            coordinate={tripData.destination.coordinates}
                            title="Destination"
                            description={tripData.destination.address}
                        >
                            <View style={{ alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#EF4444', borderRadius: 20, padding: 8 }}>
                                    <Ionicons name="flag" size={20} color="#fff" />
                                </View>
                            </View>
                        </Marker>
                    )}

                    {/* Customer Location */}
                    {tripData && (
                        <Marker 
                            coordinate={tripData.pickupLocation.coordinates}
                            title={tripData.customerName}
                            description="Customer Location"
                        >
                            <View style={{ alignItems: 'center' }}>
                                <Image source={userImg} style={{ width: 40, height: 40, borderRadius: 20 }} />
                            </View>
                        </Marker>
                    )}

                    {/* Route Polyline */}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#22C55E"
                            strokeWidth={4}
                            lineDashPattern={[1]}
                        />
                    )}

                    {/* Nearby Drivers (only show if no active trip) */}
                    {!tripData && nearByDrivers?.map(driver => (
                        <Marker key={driver.id} coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}>
                            <View style={{ alignItems: 'center' }}>
                                <Image source={carImg} style={{ width: 19, height: 40 }} />
                            </View>
                        </Marker>
                    ))}
                </MapView>

            </View>



            <Modal animationType="slide" transparent={true} visible={isOrderAcceptedModalVisible} onRequestClose={() => setIsOrderAcceptedModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.checkIconContainer}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark-sharp" size={60} color="white" />
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>Your order has been accepted</Text>
                        <Text style={styles.modalText}>Your package will get to you shortly.</Text>
                        <TouchableOpacity style={styles.keepTrackButton} onPress={() => { setIsOrderAcceptedModalVisible(false); setonTheWayVisible(true) }}>
                            <Text style={styles.keepTrackText}>Keep track</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal animationType="slide" transparent={true} visible={onTheWayVisible} onRequestClose={() => setonTheWayVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.checkIconContainer}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark-sharp" size={60} color="white" />
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>Your package is on the way!!!</Text>
                        <Text style={styles.modalText}>Your package will get to you shortly.</Text>
                        <TouchableOpacity style={styles.keepTrackButton} onPress={() => { setonTheWayVisible(false); setTrackVisible(true) }}>
                            <Text style={styles.keepTrackText}>Keep track</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <Modal animationType="slide" transparent={true} visible={trackVisible} onRequestClose={() => setTrackVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>

                        {/* Header */}
                        <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginBottom: 20 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#333' }}>Track your order</Text>
                            <TouchableOpacity onPress={() => { setTrackVisible(false); navigation.navigate("home/chats") }} style={{ backgroundColor: '#e6f9e8', borderRadius: 10, padding: 8 }}>
                                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#2ECC71" />
                            </TouchableOpacity>
                        </View>

                        {/* */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Estimated delivery date</Text>
                                <Text style={{ fontSize: 16, color: '#666' }}>{deliveryDetails.estimatedTime}</Text>
                            </View>
                        </View>

                        {/* */}
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Pickup Location</Text>
                            <Text style={{ fontSize: 16, color: '#666' }}>{deliveryDetails.pickupLocation}</Text>
                        </View>

                        {/* */}
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Dropoff Location</Text>
                            <Text style={{ fontSize: 16, color: '#666' }}>{deliveryDetails.dropoffLocation}</Text>
                        </View>


                        {/* Trip Actions */}
                        <View style={{ marginTop: 20 }}>
                            {!tripStarted && tripData?.status === 'accepted' && (
                                <TouchableOpacity onPress={startTripNavigation} style={{ backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Start Navigation</Text>
                                </TouchableOpacity>
                            )}
                            
                            {tripStarted && (
                                <TouchableOpacity onPress={completeTrip} style={{ backgroundColor: '#F59E0B', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Complete Trip</Text>
                                </TouchableOpacity>
                            )}

                            {/* Navigation Info */}
                            {estimatedTime && distance && (
                                <View style={{ backgroundColor: '#F3F4F6', borderRadius: 10, padding: 15, marginBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Ionicons name="time-outline" size={20} color="#6B7280" />
                                            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>ETA</Text>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{estimatedTime}</Text>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Ionicons name="speedometer-outline" size={20} color="#6B7280" />
                                            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Distance</Text>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{distance}</Text>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Ionicons name="cash-outline" size={20} color="#6B7280" />
                                            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Fare</Text>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#22C55E' }}>₴{tripData?.fare?.totalFare}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity onPress={() => { setTrackVisible(false); setTripCancelledModel(true) }} style={{ backgroundColor: '#FF6B6B', borderRadius: 10, paddingVertical: 15, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Cancel Trip</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>


            {tripCancelledModel && (
                <Modal visible={tripCancelledModel} animationType="fade" transparent={true}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>

                        <View style={{ backgroundColor: 'white', borderRadius: 15, marginHorizontal: 0, padding: 10, alignItems: 'center' }}>

                            <View style={{ backgroundColor: '#FFDDDD', borderRadius: 30, padding: 15, marginBottom: 20, }}>
                                <Ionicons name="close" size={30} color="#FF6B6B" />
                            </View>

                            {/* Title */}
                            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#333', marginBottom: 10 }}>Order cancelled! </Text>

                            {/* Subtitle */}
                            <Text style={{ fontSize: 16, color: '#777', textAlign: 'center', marginBottom: 25 }}>Your order has been successfully cancelled.</Text>

                            {/* Action Buttons */}
                            <TouchableOpacity style={{ width: 300, backgroundColor: '#2ECC71', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 30, marginBottom: 10 }} onPress={() => { setTripCancelledModel(false); navigation.navigate("home/delivery"); }}>
                                <Text style={{ color: 'white', textAlign: "center" }}>Book another ride</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ width: 300, backgroundColor: '#E0F7FA', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 30 }} onPress={() => { setTripCancelledModel(false); navigation.navigate("home/rate"); }}>
                                <Text style={{ color: '#00ACC1', textAlign: "center" }}>Not now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}


        </View>

    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
        width: '100%',
    },
    checkIconContainer: {
        backgroundColor: '#E0F7FA',
        borderRadius: 70,
        padding: 10,
        marginBottom: 20,
    },
    checkCircle: {
        backgroundColor: '#27AE60',
        borderRadius: 50,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    keepTrackButton: {
        backgroundColor: '#27AE60',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 30,
        width: '100%',
        alignItems: 'center',
    },
    keepTrackText: {
        color: 'white',
    },
});

export default MapScreen