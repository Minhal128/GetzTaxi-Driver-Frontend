import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Switch } from 'react-native';
import BottomNavbar from '../../components/BottomNavbar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import userImg from '../../assets/images/home/user.png';

const translations = {
    English: {
        Your_profile: 'Your profile',
        Edit_your_profile_details: 'Edit your profile details',
        Notifications: 'Notifications',
        Stay_updated_with_trip_requests_alerts: 'Stay updated with trip requests alerts',
        Your_rides: 'Your rides',
        Track_your_completed_ongoing_trips: 'Track your completed, ongoing trips',
        Pre_booked_rides: 'Pre-booked rides',
        Manage_your_trips_ahead_of_time: 'Manage your trips ahead of time',
        Settings: 'Settings',
        Customize_your_preferences_language: 'Customize your preferences, language',
        Cars: 'Cars',
        Manage_your_registered_vehicle_details: 'Manage your registered vehicle details',
        Support_center: 'Support center',
        Get_help_report_issues: 'Get help, report issues',
        Logout: 'Logout',
        Toggle_Theme: 'Toggle Theme',
        Confirm_Logout: 'Confirm Logout',
        Are_you_sure_you_want_to_logout: 'Are you sure you want to logout?',
        Cancel: 'Cancel',
        Profile: 'Profile',
    },
    Russian: {
        Your_profile: 'Ваш профиль',
        Edit_your_profile_details: 'Редактировать детали профиля',
        Notifications: 'Уведомления',
        Stay_updated_with_trip_requests_alerts: 'Будьте в курсе оповещений о запросах поездок',
        Your_rides: 'Ваши поездки',
        Track_your_completed_ongoing_trips: 'Отслеживайте завершенные и текущие поездки',
        Pre_booked_rides: 'Предзаказанные поездки',
        Manage_your_trips_ahead_of_time: 'Управляйте своими поездками заранее',
        Settings: 'Настройки',
        Customize_your_preferences_language: 'Настройте свои предпочтения, язык',
        Cars: 'Автомобили',
        Manage_your_registered_vehicle_details: 'Управляйте данными зарегистрированных автомобилей',
        Support_center: 'Центр поддержки',
        Get_help_report_issues: 'Получите помощь, сообщите о проблемах',
        Logout: 'Выйти',
        Toggle_Theme: 'Изменить тему',
        Confirm_Logout: 'Подтвердите выход',
        Are_you_sure_you_want_to_logout: 'Вы уверены, что хотите выйти?',
        Cancel: 'Отмена',
        Profile: 'Профиль',
    },
    Ukrainian: {
        Your_profile: 'Ваш профіль',
        Edit_your_profile_details: 'Редагувати дані профілю',
        Notifications: 'Сповіщення',
        Stay_updated_with_trip_requests_alerts: 'Будьте в курсі сповіщень про запити на поїздки',
        Your_rides: 'Ваші поїздки',
        Track_your_completed_ongoing_trips: 'Відстежуйте завершені та поточні поїздки',
        Pre_booked_rides: 'Попередньо замовлені поїздки',
        Manage_your_trips_ahead_of_time: 'Керуйте своїми поїздками заздалегідь',
        Settings: 'Налаштування',
        Customize_your_preferences_language: 'Налаштуйте свої параметри, мову',
        Cars: 'Автомобілі',
        Manage_your_registered_vehicle_details: 'Керуйте даними зареєстрованих транспортних засобів',
        Support_center: 'Центр підтримки',
        Get_help_report_issues: 'Отримайте допомогу, повідомте про проблеми',
        Logout: 'Вийти',
        Toggle_Theme: 'Змінити тему',
        Confirm_Logout: 'Підтвердьте вихід',
        Are_you_sure_you_want_to_logout: 'Ви впевнені, що хочете вийти?',
        Cancel: 'Скасувати',
        Profile: 'Профіль',
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

const Profile = () => {
    const navigation = useNavigation();
    const { isDarkTheme, toggleTheme } = useTheme();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const words = useLanguage();

    // Load user profile data
    useEffect(() => {
        loadUserProfile();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [])
    );

    const loadUserProfile = async () => {
        try {
            const storedProfile = await AsyncStorage.getItem('userProfile');
            if (storedProfile) {
                setUserProfile(JSON.parse(storedProfile).data);
            }
            if (storedProfile) {
                const profileData = JSON.parse(storedProfile);
                setUserProfile(profileData.data);
                console.log('📱 User profile loaded:', profileData.data);
            }
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
        }
    };

    const handleLogout = () => {
        console.log('Logging out...');
        setIsLogoutModalVisible(false);
        navigation.navigate('login');
    };

    const handleCancelLogout = () => {
        setIsLogoutModalVisible(false);
    };

    const handleOpenLogoutModal = () => {
        setIsLogoutModalVisible(true);
    };

    const profileOptions = [
        {
            icon: 'person-outline',
            title: words?.Your_profile || 'Your profile',
            subtitle: words?.Edit_your_profile_details || 'Edit your profile details',
            onPress: () => navigation.navigate('home/profiledetails'),
        },
        {
            icon: 'notifications-outline',
            title: words?.Notifications || 'Notifications',
            subtitle: words?.Stay_updated_with_trip_requests_alerts || 'Stay updated with trip requests alerts',
            onPress: () => navigation.navigate('home/notificationsettings'),
        },
        {
            icon: 'car-sport-outline',
            title: words?.Your_rides || 'Your rides',
            subtitle: words?.Track_your_completed_ongoing_trips || 'Track your completed, ongoing trips',
            onPress: () => navigation.navigate('home/yourrides'),
        },
        {
            icon: 'calendar-number-outline',
            title: words?.Pre_booked_rides || 'Pre-booked rides',
            subtitle: words?.Manage_your_trips_ahead_of_time || 'Manage your trips ahead of time',
            onPress: () => navigation.navigate('home/prebooked'),
        },
        {
            icon: 'settings-outline',
            title: words?.Settings || 'Settings',
            subtitle: words?.Customize_your_preferences_language || 'Customize your preferences, language',
            onPress: () => navigation.navigate('home/settings'),
        },
        {
            icon: 'people-outline',
            title: words?.Cars || 'Cars',
            subtitle: words?.Manage_your_registered_vehicle_details || 'Manage your registered vehicle details',
            onPress: () => navigation.navigate('home/cars'),
        },
        {
            icon: 'information-circle-outline',
            title: words?.Support_center || 'Support center',
            subtitle: words?.Get_help_report_issues || 'Get help, report issues',
            onPress: () => console.log('Support center'),
        },
        {
            icon: 'log-out-outline',
            title: words?.Logout || 'Logout',
            subtitle: '',
            onPress: handleOpenLogoutModal,
            iconColor: '#FF6B6B',
            textColor: '#FF6B6B',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme && "#0f172a" }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{words?.Profile || 'Profile'}</Text>
            </View>

            {/* User Profile Header */}
            {userProfile && (
                <View style={[styles.profileHeader, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
                    <Image 
                        source={userProfile?.profileImage ? { uri: userProfile.profileImage } : userImg}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: isDarkTheme ? "#fff" : "#333" }]}>
                            {userProfile?.fullName || userProfile?.email?.split('@')[0] || userProfile?.phoneNumber || 'Driver'}
                        </Text>
                        <Text style={styles.profileRole}>
                            {userProfile?.role === 'driver' ? 'Driver' : userProfile?.role || 'Driver'}
                        </Text>
                        <Text style={styles.profileLocation}>
                            {userProfile?.city && userProfile?.country 
                                ? `${userProfile.city}, ${userProfile.country}` 
                                : 'Location not set'}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('home/profiledetails')}
                        style={styles.editProfileButton}
                    >
                        <Ionicons name="create-outline" size={20} color="#2ECC71" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {profileOptions.map((option, index) => (
                    <TouchableOpacity key={index} onPress={option.onPress} style={[styles.optionItem, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
                        <View style={styles.optionLeft}>
                            <View style={[styles.optionIconContainer, { backgroundColor: `${option.iconColor || '#2ECC71'}1A` }]}>
                                <Ionicons name={option.icon} size={24} color={option.iconColor || '#2ECC71'} />
                            </View>
                            <View style={{flex:1}}>
                                <Text style={[styles.optionTitle, { color: isDarkTheme ? "#fff" : option.textColor || '#333' }]}>{option.title}</Text>
                                {option.subtitle && <Text style={styles.optionSubtitle}>{option.subtitle}</Text>}
                            </View>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={20} color="#777" />
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.optionItem, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.optionIconContainer, { backgroundColor: `${'#2ECC71'}1A` }]}>
                            <Entypo name="colours" size={20} color="#2ECC71" />
                        </View>
                        <View>
                            <Text style={[styles.optionTitle, { color: isDarkTheme ? "#fff" : '#333' }]}>{isDarkTheme ? 'Dark Mode' : 'Light Mode'}</Text>
                        </View>
                    </View>
                    <Switch
                        trackColor={{ false: '#2ECC71', true: '#2ECC71' }}
                        thumbColor={isDarkTheme ? '#fff' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => toggleTheme(!isDarkTheme)}
                        value={isDarkTheme}
                    />
                </TouchableOpacity>
            </ScrollView>

            {/* Logout Modal */}
            <Modal animationType="fade" transparent={true} visible={isLogoutModalVisible} onRequestClose={handleCancelLogout}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{words?.Confirm_Logout || 'Confirm Logout'}</Text>
                        <Text style={styles.modalMessage}>{words?.Are_you_sure_you_want_to_logout || 'Are you sure you want to logout?'}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={handleCancelLogout} style={styles.modalCancelButton}>
                                <Text style={styles.modalCancelText}>{words?.Cancel || 'Cancel'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleLogout} style={styles.modalLogoutButton}>
                                <Text style={styles.modalLogoutText}>{words?.Logout || 'Logout'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <BottomNavbar />
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
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 80
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
        marginBottom: 2,
        fontSize: 16,
        maxWidth:"100%"
    },
    optionSubtitle: {
        color: '#777',
        fontSize: 12,
        maxWidth:"90%",
        flex:1
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 25,
        width: '80%',
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalMessage: {
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalCancelButton: {
        backgroundColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalCancelText: {
        color: '#555',
        fontWeight: 'bold',
    },
    modalLogoutButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    modalLogoutText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // Profile header styles
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
        color: '#2ECC71',
        fontWeight: '600',
        marginBottom: 2,
    },
    profileLocation: {
        fontSize: 12,
        color: '#777',
    },
    editProfileButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#E0F7EF',
    },
});


export default Profile;