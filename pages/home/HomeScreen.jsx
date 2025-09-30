import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, TouchableWithoutFeedback, Text, TouchableOpacity, View, ScrollView, StyleSheet, StatusBar, Image } from 'react-native';
import BottomNavbar from '../../components/BottomNavbar';
import MapView, { Marker } from 'react-native-maps';
import userImg from '../../assets/images/home/user.png';
import mapImg from '../../assets/images/home/map.png';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import config from '../../config';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const darkMapStyle = [
    {
        elementType: 'geometry',
        stylers: [{ color: '#0F172A' }],
    },
    {
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
    {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#1E293B' }],
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#0F172A' }],
    },
    {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: '#1E293B' }],
    },
    {
        featureType: 'administrative.country',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9e9e9e' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#bdbdbd' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [{ color: '#2c2c2c' }],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#8a8a8a' }],
    },
    {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{ color: '#373737' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#3c3c3c' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#0F172A' }],
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{ color: '#4e4e4e' }],
    },
    {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#616161' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#1E293B' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#000000' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#3d3d3d' }],
    },
];


const translations = {
    English: {
        Loading: "Loading Map Please Wait",
        Trip: 'Trip',
        Offline: 'Offline',
        Delivery: 'Delivery',
        Notifications: 'Notifications',
        Your_requests: 'Your requests',
        View_all: 'View all',
        Near_Rockwood_villa: 'Near Rockwood villa',
        St_Paul_UNG_1354_USA: 'St Paul, UNG 1354,USA',
        Ignore: 'Ignore',
        Accept: 'Accept',
        Passenger_s_pickup: 'Passenger’s pickup',
        Navigate_to_customer_s_location: 'Navigate to customer\'s location',
        Start_trip: 'Start trip',
        Turn_right_on_Madison_street: 'Turn right on Madison street',
        miles_ahead: 'miles ahead',
        Turn_left_on_4th_Avenue: 'Turn left on 4th Avenue',
        Continue_straight_at_105_N_Lk: 'Continue straight at 105 N Lk',
        Complete_trip: 'Complete trip',
        Cancel_ride: 'Cancel ride',
        Arrived_at_customer_location: 'Arrived at customer location',
        Cash_payment: 'Cash payment',
        Your_delivery_requests: 'Your delivery requests',
        Offline_mode: 'Offline mode',
        You_re_now_offline_Switch_back_anytime_to_start_accepting_orders:
            'You\'re now offline. Switch back anytime to start accepting orders',
        Trip_mode_activated: 'Trip mode activated',
        You_re_now_available_for_ride_requests: 'You\'re now available for ride requests.',
        Hours_online: 'Hours online',
        Distance: 'Distance',
        Total_jobs: 'Total jobs',
        Years: 'Years',
        Driver_preferences: 'Driver preferences',
        Pick_up: 'Pick up',
        Drop_off: 'Drop off',
        Grace_Jwekmlin: 'Grace Jwekmlin',
        Call: 'Call',
        Start_delivery: 'Start delivery',
    },
    Russian: {
        Loading: "Загрузка карты, пожалуйста, подождите",
        Trip: 'Поездка',
        Offline: 'Оффлайн',
        Delivery: 'Доставка',
        Notifications: 'Уведомления',
        Your_requests: 'Ваши запросы',
        View_all: 'Смотреть все',
        Near_Rockwood_villa: 'Рядом с виллой Роквуд',
        St_Paul_UNG_1354_USA: 'Сент-Пол, UNG 1354, США',
        Ignore: 'Игнорировать',
        Accept: 'Принять',
        Passenger_s_pickup: 'Посадка пассажира',
        Navigate_to_customer_s_location: 'Навигировать к местоположению клиента',
        Start_trip: 'Начать поездку',
        Turn_right_on_Madison_street: 'Поверните направо на Мэдисон-стрит',
        miles_ahead: 'миль вперед',
        Turn_left_on_4th_Avenue: 'Поверните налево на 4-ю авеню',
        Continue_straight_at_105_N_Lk: 'Продолжайте прямо на 105 N Lk',
        Complete_trip: 'Завершить поездку',
        Cancel_ride: 'Отменить поездку',
        Arrived_at_customer_location: 'Прибыли к местоположению клиента',
        Cash_payment: 'Оплата наличными',
        Your_delivery_requests: 'Ваши запросы на доставку',
        Offline_mode: 'Оффлайн режим',
        You_re_now_offline_Switch_back_anytime_to_start_accepting_orders:
            'Вы сейчас не в сети. Вернитесь в сеть в любое время, чтобы начать принимать заказы',
        Trip_mode_activated: 'Режим поездки активирован',
        You_re_now_available_for_ride_requests: 'Вы теперь доступны для запросов на поездку.',
        Hours_online: 'Часов онлайн',
        Distance: 'Расстояние',
        Total_jobs: 'Всего заказов',
        Years: 'Лет',
        Driver_preferences: 'Настройки водителя',
        Pick_up: 'Забрать',
        Drop_off: 'Высадить',
        Grace_Jwekmlin: 'Грейс Жвеклин',
        Call: 'Позвонить',
        Start_delivery: 'Начать доставку',
    },
    Ukrainian: {
        Loading: "Завантаження карти, будь ласка, зачекайте",
        Trip: 'Поїздка',
        Offline: 'Офлайн',
        Delivery: 'Доставка',
        Notifications: 'Сповіщення',
        Your_requests: 'Ваші запити',
        View_all: 'Переглянути всі',
        Near_Rockwood_villa: 'Поруч з віллою Роквуд',
        St_Paul_UNG_1354_USA: 'Сент-Пол, UNG 1354, США',
        Ignore: 'Ігнорувати',
        Accept: 'Прийняти',
        Passenger_s_pickup: 'Забрати пасажира',
        Navigate_to_customer_s_location: 'Маршрут до клієнта АБО Навігація до клієнта',
        Start_trip: 'Почати поїздку',
        Turn_right_on_Madison_street: 'Поверніть праворуч на вулицю Медісон',
        miles_ahead: 'миль вперед',
        Turn_left_on_4th_Avenue: 'Поверніть ліворуч на 4-ту авеню',
        Continue_straight_at_105_N_Lk: 'Продовжуйте прямо на 105 N Lk',
        Complete_trip: 'Завершити поїздку',
        Cancel_ride: 'Скасувати поїздку',
        Arrived_at_customer_location: 'Прибули до місцезнаходження клієнта',
        Cash_payment: 'Оплата готівкою',
        Your_delivery_requests: 'Ваші запити на доставку',
        Offline_mode: 'Офлайн режим',
        You_re_now_offline_Switch_back_anytime_to_start_accepting_orders:
            'Ви зараз не в мережі. Поверніться в мережу в будь-який час, щоб почати приймати замовлення',
        Trip_mode_activated: 'Режим поїздки активовано',
        You_re_now_available_for_ride_requests: 'Ви тепер доступні для запитів на поїздку.',
        Hours_online: 'Годин онлайн',
        Distance: 'Відстань',
        Total_jobs: 'Всього робіт',
        Years: 'Років',
        Driver_preferences: 'Налаштування водія',
        Pick_up: 'Забрати',
        Drop_off: 'Висадити',
        Grace_Jwekmlin: 'Грейс Жвеклін',
        Call: 'Зателефонувати',
        Start_delivery: 'Почати доставку',
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


const HomeScreen = () => {
    const navigation = useNavigation()
    const words = useLanguage();
    const mapRef = useRef(null);
    const { isDarkTheme } = useTheme();
    const [userProfile, setUserProfile] = useState(null)
    const [userlocation, setUserLocation] = useState(null);
    const [nearByDrivers, setNearByDrivers] = useState([]);

    const [selectedService, setSelectedService] = useState('Offline');
    const [driverProfile, setDriverProfile] = useState(false)

    const [newRide, setnewRide] = useState(false);
    const [passengerPickup, setPassengerPickup] = useState(false)
    const [startTrip, setStartTrip] = useState(false);
    const [endTrip, setEndTrip] = useState(false)
    const [rideCompletion, setRideCompletion] = useState(false)

    const [newDelivery, setnewDelivery] = useState(false);
    const [startDelivery, setstartDelivery] = useState(false)
    const [loading, setloading] = useState(true)

    // Trip requests state
    const [tripRequests, setTripRequests] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);


    const getUserLocation = async () => {
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

    const fetchProfileInfo = async () => {
        try {
            let userId = await AsyncStorage.getItem('user_id');
            console.log(userId, 'userId')
            let res = await axios.get(`${config.baseUrl}/driver/info/${userId}`);
            if (res?.data) {
                setUserProfile(res?.data?.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch available trip requests
    const fetchTripRequests = async () => {
        try {
            setLoadingTrips(true);
            const authToken = await AsyncStorage.getItem('authToken');
            
            if (!authToken) {
                console.log('No auth token found');
                return;
            }

            let url = `${config.baseUrl}/trip/available`;
            
            // Add location parameters if available
            if (userlocation) {
                url += `?latitude=${userlocation.latitude}&longitude=${userlocation.longitude}&radius=10`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                setTripRequests(response.data.data || []);
                console.log('✅ Fetched', response.data.count, 'trip requests');
            }

        } catch (error) {
            console.error('❌ Error fetching trip requests:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to load trip requests',
                text2: error.response?.data?.msg || error.message
            });
        } finally {
            setLoadingTrips(false);
        }
    };

    // Accept a trip request
    const acceptTripRequest = async (tripId) => {
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            
            if (!authToken) {
                Toast.show({ type: 'error', text1: 'Authentication required' });
                return;
            }

            const response = await axios.put(`${config.baseUrl}/trip/${tripId}/accept`, {}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                Toast.show({ type: 'success', text1: 'Trip accepted successfully!' });
                setSelectedTrip(response.data.data);
                setnewRide(false);
                setPassengerPickup(true);
                
                // Refresh trip requests
                fetchTripRequests();
            }

        } catch (error) {
            console.error('❌ Error accepting trip:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to accept trip',
                text2: error.response?.data?.msg || error.message
            });
        }
    };

    useEffect(() => {
        getUserLocation();
        fetchProfileInfo()
        setTimeout(() => {
            setloading(false)
        }, 5000);

    }, []);

    // Fetch trip requests when service changes to "Trip" or "Delivery" or location updates
    useEffect(() => {
        if ((selectedService === 'Trip' || selectedService === 'Delivery') && userlocation) {
            fetchTripRequests();
        }
    }, [selectedService, userlocation]);

    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setHidden(true);
            return () => {
                StatusBar.setHidden(false);
            };
        }, [])
    );

    const centerMapOnUser = async () => {
        try {
            mapRef.current.animateToRegion(userlocation, 1000);
        } catch (error) {
            console.error('Error getting location', error);
        }
    };

    return (
        loading ?
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDarkTheme ? "#0F172A" : "#fff" }}>
                <Text style={{ color: isDarkTheme ? "#fff" : "#333" }}>{words?.Loading || "Loading Map Please Wait"}</Text>
            </View > :
            <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#0F172A" : "#fff" }}>

                <StatusBar hidden={false} />

                <View style={{ flex: 1, position: "relative" }}>


                    {/* TOPBAR  */}
                    <View style={{ position: "absolute", top: 36, left: 0, right: 0, justifyContent: "flex-end", alignItems: "center", flexDirection: "row", gap: 10, paddingHorizontal: 20, zIndex: 100 }}>

                        <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#1E293B" : "#fff", padding: 5, height: 50, borderRadius: 6, flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => { setSelectedService("Trip"); setnewRide(true) }} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: selectedService == "Trip" ? "#2ECC71" : isDarkTheme ? "#1E293B" : "#fff", }}>
                                <Text style={{ color: selectedService == "Trip" ? "#fff" : isDarkTheme ? "#CBD5E0" : "#475569" }}>{words?.Trip || 'Trip'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setSelectedService("Offline"); setDriverProfile(true) }} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: selectedService == "Offline" ? "#2ECC71" : isDarkTheme ? "#1E293B" : "#fff", }}>
                                <Text style={{ color: selectedService == "Offline" ? "#fff" : isDarkTheme ? "#CBD5E0" : "#475569" }}>{words?.Offline || 'Offline'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setSelectedService("Delivery"); setnewRide(false); setDriverProfile(false); setnewDelivery(true) }} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: selectedService == "Delivery" ? "#2ECC71" : isDarkTheme ? "#1E293B" : "#fff", }}>
                                <Text style={{ color: selectedService == "Delivery" ? "#fff" : isDarkTheme ? "#CBD5E0" : "#475569" }}>{words?.Delivery || 'Delivery'}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => navigation.navigate("home/notification")} style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }}>
                            <EvilIcons name="bell" size={24} color={isDarkTheme ? "#fff" : "black"} style={{ marginTop: -5 }} />
                        </TouchableOpacity>

                    </View>

                    {/* MAP */}
                    <MapView ref={mapRef} customMapStyle={isDarkTheme ? darkMapStyle : undefined} style={{ width: '100%', height: '100%' }} region={userlocation || { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }} showsUserLocation showsMyLocationButton={false}>

                        <Marker  image={require("../../assets/images/home/user.png")} coordinate={userlocation || { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}></Marker>
                        {nearByDrivers?.map(driver => (
                            <Marker key={driver?.latitude} coordinate={{ latitude: driver.latitude, longitude: driver.longitude }} image={require("../../assets/images/home/car.png")} />
                        ))}
                    </MapView>

                </View>

                {
                    (selectedService == "Offline" && !newDelivery) ?
                        <Modal visible={driverProfile} animationType="slide" transparent={true}>
                            <TouchableWithoutFeedback onPress={() => setDriverProfile(!driverProfile)}>
                                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', justifyContent: "center", alignItems: "center", borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', paddingVertical: 20 }}>

                                        <Image source={userProfile?.profile_img ? { uri: userProfile?.profile_img } : require("../../assets/images/home/user.png")} style={{ width: 60, height: 60, borderRadius: 60 }} />
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                            <AntDesign name="star" size={20} color="orange" />
                                            <Text style={{ color: isDarkTheme ? "#fff" : "#64748B" }}>{userProfile?.username}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, paddingHorizontal: 10 }}>
                                            <View style={{ alignItems: 'center' }}>
                                                <View style={[styles.iconBackground, { backgroundColor: isDarkTheme ? "#0F172A" : "#E8F8F5" }]}>
                                                    <Ionicons name="time-outline" size={24} color="#22C55E" />
                                                </View>
                                                <Text style={[styles.valueText, { color: isDarkTheme ? "#fff" : "#334155" }]}>0</Text>
                                                <Text style={styles.label}>{words?.Hours_online || 'Hours online'}</Text>
                                            </View>
                                            <View style={{ alignItems: 'center' }}>
                                                <View style={[styles.iconBackground, { backgroundColor: isDarkTheme ? "#0F172A" : "#E8F8F5" }]}>
                                                    <Ionicons name="car-outline" size={24} color="#22C55E" />
                                                </View>
                                                <Text style={[styles.valueText, { color: isDarkTheme ? "#fff" : "#334155" }]}>0 km</Text>
                                                <Text style={styles.label}>{words?.Distance || 'Distance'}</Text>
                                            </View>
                                            <View style={{ alignItems: 'center' }}>
                                                <View style={[styles.iconBackground, { backgroundColor: isDarkTheme ? "#0F172A" : "#E8F8F5" }]}>
                                                    <Ionicons name="briefcase-outline" size={24} color="#22C55E" />
                                                </View>
                                                <Text style={[styles.valueText, { color: isDarkTheme ? "#fff" : "#334155" }]}>0</Text>
                                                <Text style={styles.label}>{words?.Total_jobs || 'Total jobs'}</Text>
                                            </View>
                                            <View style={{ alignItems: 'center' }}>
                                                <View style={[styles.iconBackground, { backgroundColor: isDarkTheme ? "#0F172A" : "#E8F8F5" }]}>
                                                    <Ionicons name="calendar-outline" size={24} color="#22C55E" />
                                                </View>
                                                <Text style={[styles.valueText, { color: isDarkTheme ? "#fff" : "#334155" }]}>0</Text>
                                                <Text style={styles.label}>{words?.Years || 'Years'}</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity onPress={() => { setDriverProfile(false); navigation.navigate("home/preference") }} style={[styles.driverPreferencesButton, { backgroundColor: isDarkTheme ? "#0F172A" : "#F8FAFC" }]}>
                                            <Ionicons name="options-outline" size={20} color={isDarkTheme ? "#fff" : "#334155"} />
                                            <Text style={[styles.driverPreferencesText, { color: isDarkTheme ? "#fff" : "#334155" }]}>{words?.Driver_preferences || 'Driver preferences'}</Text>
                                            <AntDesign name="right" size={20} color={isDarkTheme ? "#fff" : "#334155"} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>
                        :

                        <Modal visible={newRide} animationType="slide" transparent={true}>
                            <TouchableWithoutFeedback onPress={() => setnewRide(!newRide)}>
                                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20 }}>

                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <Text style={{ fontSize: 20, fontWeight: "700", color: isDarkTheme ? "#fff" : "#333" }}>{words?.Your_requests || 'Your requests'}</Text>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <TouchableOpacity onPress={fetchTripRequests} style={{ marginRight: 15 }}>
                                                    <Ionicons name="refresh" size={20} color="#2ECC71" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => { setnewRide(false); navigation.navigate("home/requests") }}>
                                                    <Text style={{ color: "#2ECC71" }}>{words?.View_all || 'View all'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                            <View style={{ flexDirection: 'row' }}>
                                                {loadingTrips ? (
                                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                                        <Text style={{ color: isDarkTheme ? "#fff" : "#333" }}>Loading trips...</Text>
                                                    </View>
                                                ) : tripRequests.length === 0 ? (
                                                    <View style={{ padding: 20, alignItems: 'center', width: 300 }}>
                                                        <Text style={{ color: isDarkTheme ? "#fff" : "#333", fontSize: 16, textAlign: 'center' }}>No trips available</Text>
                                                        <Text style={{ color: "#94A3B8", fontSize: 14, textAlign: 'center', marginTop: 5 }}>Check back later for new ride requests</Text>
                                                    </View>
                                                ) : (
                                                    tripRequests?.map((trip) => (
                                                        <View key={trip._id} style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', borderRadius: 10, borderWidth: 1, borderColor: isDarkTheme ? "#334155" : "#F4F4F4", marginRight: 10, marginTop: 10, width: 280 }}>
                                                            <Image source={mapImg} style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, width: '100%' }} />
                                                            <View style={{ padding: 15 }}>
                                                                <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8, color: isDarkTheme ? "#fff" : "#333" }}>
                                                                    {trip.customerName}
                                                                </Text>
                                                                <View style={{ marginBottom: 10 }}>
                                                                    <Text style={{ fontSize: 14, fontWeight: "600", color: isDarkTheme ? "#fff" : "#333", marginBottom: 2 }}>From:</Text>
                                                                    <Text style={{ color: "#94A3B8", fontSize: 12 }}>{trip.pickupLocation.address}</Text>
                                                                </View>
                                                                <View style={{ marginBottom: 10 }}>
                                                                    <Text style={{ fontSize: 14, fontWeight: "600", color: isDarkTheme ? "#fff" : "#333", marginBottom: 2 }}>To:</Text>
                                                                    <Text style={{ color: "#94A3B8", fontSize: 12 }}>{trip.destination.address}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                        <Ionicons name="location-outline" size={14} color="#94A3B8" />
                                                                        <Text style={{ color: "#94A3B8", fontSize: 12, marginLeft: 4 }}>{trip.distance?.toFixed(1)} km</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                        <Ionicons name="time-outline" size={14} color="#94A3B8" />
                                                                        <Text style={{ color: "#94A3B8", fontSize: 12, marginLeft: 4 }}>{trip.estimatedDuration} min</Text>
                                                                    </View>
                                                                    <Text style={{ color: "#2ECC71", fontSize: 16, fontWeight: "700" }}>₴{trip.fare.totalFare}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <TouchableOpacity onPress={() => setnewRide(false)} style={{ borderWidth: !isDarkTheme ? 1 : 0, backgroundColor: isDarkTheme ? "#0F172A" : "#fff", borderColor: "#2ECC71", flex: 1, marginRight: 10, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
                                                                        <Text style={{ color: isDarkTheme ? "#fff" : "#2ECC71" }}>{words?.Ignore || 'Ignore'}</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity onPress={() => acceptTripRequest(trip._id)} style={{ backgroundColor: "#2ECC71", flex: 1, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 8 }}>
                                                                        <Text style={{ color: "#fff" }}>{words?.Accept || 'Accept'}</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    ))
                                                )}
                                            </View>
                                        </ScrollView>

                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        </Modal>
                }

                <TouchableOpacity onPress={centerMapOnUser} style={{ position: "absolute", bottom: (newRide || driverProfile || passengerPickup || startTrip || endTrip || rideCompletion || newDelivery || startDelivery) ? 330 : 100, right: 10, width: 40, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 100, backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }}>
                    <FontAwesome6 name="location-arrow" size={20} color={!isDarkTheme ? "black" : "#fff"} />
                </TouchableOpacity>


                {/* Passenger’s pickup */}
                <Modal visible={passengerPickup} animationType="slide" transparent={true}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20 }}>

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                                <Text style={{ fontWeight: "700", color: isDarkTheme ? "#94A3B8" : "#94A3B8", fontSize: 16 }}>{words?.Passenger_s_pickup || 'Passenger’s pickup'}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", marginBottom: 20 }}>
                                <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 1000, padding: 10 }}>
                                    <Ionicons name="location" size={20} color="#22C55E" />
                                </View>
                                <Text style={{ fontSize: 18, color: isDarkTheme ? "#fff" : '#334155', fontWeight: '500' }}>210 Cross road junction</Text>
                                <TouchableOpacity onPress={() => { setPassengerPickup(false); navigation.navigate("home/msg") }} style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 1000, padding: 10 }}>
                                    <Feather name="message-square" size={20} color="#22C55E" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => { setPassengerPickup(false); setStartTrip(true) }} style={{ backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 16 }}>{words?.Navigate_to_customer_s_location || 'Navigate to customer\'s location'}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/* START TRIP  */}
                <Modal visible={startTrip} animationType="slide" transparent={true}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20 }}>

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                                <Text style={{ fontWeight: "700", color: isDarkTheme ? "#94A3B8" : "#94A3B8", fontSize: 16 }}>{words?.Passenger_s_pickup || 'Passenger’s pickup'}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', marginBottom: 20 }}>
                                <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 1000, padding: 10 }}>
                                    <Ionicons name="location" size={20} color="#22C55E" />
                                </View>
                                <Text style={{ fontSize: 18, color: isDarkTheme ? "#fff" : '#334155', fontWeight: '500' }}>210 Cross road junction</Text>

                                <TouchableOpacity onPress={() => { setStartTrip(false); navigation.navigate("home/msg") }} style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 1000, padding: 10 }}>
                                    <Feather name="message-square" size={20} color="#22C55E" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => { setEndTrip(true); setStartTrip(false) }} style={{ backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 16 }}>{words?.Start_trip || 'Start trip'}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/* END TRIP  */}
                <Modal visible={endTrip} animationType="slide" transparent={true}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20 }}>

                            <View style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 100, padding: 8, marginRight: 12 }}>
                                        <Ionicons name="arrow-forward-outline" size={20} color="#22C55E" />
                                    </View>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: isDarkTheme ? "#fff" : '#334155' }}>{words?.Turn_right_on_Madison_street || 'Turn right on Madison street'}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>{`18 ${words?.miles_ahead || 'miles ahead'}`}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 100, padding: 8, marginRight: 12 }}>
                                        <Ionicons name="arrow-forward-outline" size={20} color="#22C55E" style={{ transform: [{ rotate: '-90deg' }] }} />
                                    </View>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: isDarkTheme ? "#fff" : '#334155' }}>{words?.Turn_left_on_4th_Avenue || 'Turn left on 4th Avenue'}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>{`60 ${words?.miles_ahead || 'miles ahead'}`}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 100, padding: 8, marginRight: 12 }}>
                                        <Ionicons name="arrow-up-outline" size={20} color="#22C55E" />
                                    </View>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: isDarkTheme ? "#fff" : '#334155' }}>{words?.Continue_straight_at_105_N_Lk || 'Continue straight at 105 N Lk'}</Text>
                                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>{`60 ${words?.miles_ahead || 'miles ahead'}`}</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => { setEndTrip(false); setRideCompletion(true) }} style={{ backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 10 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{words?.Complete_trip || 'Complete trip'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setEndTrip(false); setRideCompletion(true) }} style={{ borderWidth: isDarkTheme ? 1 : 0, borderColor: "#334155", backgroundColor: !isDarkTheme ? '#E0F2F7' : "#1E293B", borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}>
                                <Text style={{ color: isDarkTheme ? "#fff" : '#22C55E', fontWeight: 'bold', fontSize: 16 }}>{words?.Cancel_ride || 'Cancel ride'}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/* TRIP COMPLETION */}
                <Modal visible={rideCompletion} animationType="slide" transparent={true}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20, alignItems: 'center' }}>

                            <View style={{ backgroundColor: '#22C55E', borderRadius: 30, padding: 15, marginBottom: 20 }}>
                                <Ionicons name="checkmark-sharp" size={30} color="white" />
                            </View>

                            <Text style={{ fontWeight: 'bold', fontSize: 18, color: isDarkTheme ? "#Fff" : '#334155', marginBottom: 5, textAlign: 'center' }}>{words?.Arrived_at_customer_location || 'Arrived at customer location'}</Text>
                            <Text style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>210 Cross road junction (12km)</Text>

                            <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 60, marginBottom: 25 }}>
                                <Text style={{ fontSize: 24, color: isDarkTheme ? "#fff" : '#22C55E' }}>₹400.69</Text>
                            </View>

                            <TouchableOpacity onPress={() => { setRideCompletion(false); navigation.navigate("home/rating") }} style={{ backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 16, paddingHorizontal: 70, alignItems: 'center', width: '80%' }}>
                                <Text style={{ color: 'white', fontSize: 16 }}>{words?.Cash_payment || 'Cash payment'}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>



                {/* DELIVERY  */}
                <Modal visible={newDelivery} animationType="slide" transparent={true}>
                    <TouchableWithoutFeedback onPress={() => setnewDelivery(!newDelivery)}>
                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20 }}>

                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={{ fontSize: 20, fontWeight: "700", color: isDarkTheme && "#fff", maxWidth: "70%", minWidth: "70%" }}>{words?.Your_delivery_requests || 'Your delivery requests'}</Text>
                                    <TouchableOpacity onPress={() => { setnewDelivery(false); navigation.navigate("home/requests") }}><Text style={{ color: "#2ECC71", flex: 1 }}>{words?.View_all || 'View all'}</Text></TouchableOpacity>
                                </View>

                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {
                                            tripRequests && tripRequests.length > 0 ? tripRequests.map((trip) => (
                                                <View key={trip._id} style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', borderRadius: 10, borderWidth: 1, borderColor: isDarkTheme ? "#334155" : "#F4F4F4", marginRight: 10, marginTop: 10 }}>
                                                    <Image source={mapImg} style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />
                                                    <View style={{ padding: 10 }}>
                                                        <Text style={{ fontSize: 17, fontWeight: "700", marginBottom: 10, color: isDarkTheme && "#fff" }}>
                                                            {trip.pickupLocation?.address?.split(',')[0] || 'Pickup Location'}
                                                        </Text>
                                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Text style={{ color: "#94A3B8", fontSize: 12, maxWidth: 120 }} numberOfLines={1}>
                                                                {trip.pickupLocation?.address || 'Address not available'}
                                                            </Text>
                                                            <Text style={{ color: "#2ECC71" }}>₴{trip.fare || '0'}</Text>
                                                        </View>
                                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                                                            <TouchableOpacity 
                                                                onPress={() => { setnewDelivery(false) }} 
                                                                style={{ borderWidth: !isDarkTheme ? 1 : 0, backgroundColor: isDarkTheme && "#0F172A", borderColor: "#2ECC71", flex: 1, marginRight: 10, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 8 }}
                                                            >
                                                                <Text style={{ color: isDarkTheme ? "#fff" : "#2ECC71" }}>{words?.Ignore || 'Ignore'}</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity 
                                                                onPress={() => handleAcceptTrip(trip._id)} 
                                                                style={{ backgroundColor: "#2ECC71", flex: 1, marginRight: 10, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 8 }}
                                                            >
                                                                <Text style={{ color: "#fff" }}>{words?.Accept || 'Accept'}</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            )) : (
                                                <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', minWidth: 200 }}>
                                                    <Ionicons name="car-outline" size={48} color="#94A3B8" />
                                                    <Text style={{ color: "#94A3B8", marginTop: 10, textAlign: 'center' }}>
                                                        {words?.No_delivery_requests || 'No delivery requests available'}
                                                    </Text>
                                                </View>
                                            )
                                        }
                                    </View>
                                </ScrollView>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>


                <Modal visible={startDelivery} animationType="slide" transparent={true}>
                    <TouchableWithoutFeedback onPress={() => setstartDelivery(!startDelivery)}>
                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                            <View style={{ backgroundColor: isDarkTheme ? "#1E293B" : 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%', padding: 20 }}>
                                {/* Driver Info */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={userImg} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                                        <View>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: isDarkTheme ? "#fff" : '#333' }}>{words?.Grace_Jwekmlin || 'Grace Jwekmlin'}</Text>
                                            <Text style={{ color: '#777', fontSize: 12 }}>+12343547867</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{ backgroundColor: '#2ECC71', borderRadius: 20, padding: 10 }}>
                                        <Ionicons name="call" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Pickup Location */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 }}>
                                    <View style={{ width: 30, alignItems: 'center' }}>
                                        <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 100, padding: 5 }}>
                                            <Ionicons name="location" size={20} color="#2ECC71" />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>45, Jos Avenue crescent</Text>
                                        <Text style={{ color: '#777', fontSize: 12 }}>{words?.Pick_up || 'Pick up'}</Text>
                                    </View>
                                </View>

                                {/* Dropoff Location */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }}>
                                    <View style={{ width: 30, alignItems: 'center' }}>
                                        <View style={{ backgroundColor: isDarkTheme ? "#334155" : '#E0F7EF', borderRadius: 100, padding: 5 }}>
                                            <Ionicons name="flag" size={20} color="#2ECC71" />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: isDarkTheme ? "#fff" : '#333' }}>210 Cross road junction</Text>
                                        <Text style={{ color: '#777', fontSize: 12 }}>{words?.Drop_off || 'Drop off'}</Text>
                                    </View>
                                </View>

                                {/* Start Trip Button */}
                                <TouchableOpacity onPress={() => { setstartDelivery(false); }} style={{ backgroundColor: '#2ECC71', borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 16 }}>{words?.Start_delivery || 'Start delivery'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>

                </Modal>

                <BottomNavbar />
            </View>

    )
}


const styles = StyleSheet.create({
    iconBackground: {
        backgroundColor: '#E8F8F5',
        borderRadius: 100,
        padding: 10,
    },
    valueText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginTop: 5,
    },
    label: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    driverPreferencesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginTop: 25,
        width: '90%',
    },
    driverPreferencesText: {
        color: '#334155',
        marginLeft: 10,
        fontWeight: '500',
        flex: 1,
    },
});

export default HomeScreen
