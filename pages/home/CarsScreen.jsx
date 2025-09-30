import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import carImg from '../../assets/images/home/car3.png';
import { useTheme } from '../../hooks/themeContext';
import axios from 'axios';
import config from '../../config';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

const translations = {
    English: {
        Cars: 'Cars',
        Mercedes_s500_AMG: 'Mercedes s500 AMG',
        Petrol: 'Petrol',
        Yellow: 'Yellow',
        Last_updated: 'Last updated',
        Edit: 'Edit',
        Delete: 'Delete',
    },
    Russian: {
        Cars: 'Автомобили',
        Mercedes_s500_AMG: 'Mercedes s500 AMG',
        Petrol: 'Бензин',
        Yellow: 'Желтый',
        Last_updated: 'Последнее обновление',
        Edit: 'Редактировать',
        Delete: 'Удалить',
    },
    Ukrainian: {
        Cars: 'Автомобілі',
        Mercedes_s500_AMG: 'Mercedes s500 AMG',
        Yellow: 'Жовтий',
        Last_updated: 'Останнє оновлення',
        Edit: 'Редагувати',
        Delete: 'Видалити',
    },
};

export const getTranslations = async (language) => {
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

const CarsScreen = () => {
    const navigation = useNavigation()
    const words = useLanguage();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDarkTheme } = useTheme();

    const fetchProfileInfo = async () => {
        try {
            setLoading(true);
            const authToken = await AsyncStorage.getItem('authToken');
            let userId = await AsyncStorage.getItem('user_id');
            
            if (!userId) {
                const storedProfile = await AsyncStorage.getItem('userProfile');
                if (storedProfile) {
                    setUserProfile(JSON.parse(storedProfile).data);
                }
                if (storedProfile) {
                    const profileData = JSON.parse(storedProfile);
                    userId = profileData.data?._id;
                }
            }

            const response = await axios.get(`${config.baseUrl}/driver/info/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                setUserProfile(response.data.data);
                console.log('✅ Car profile loaded:', response.data.data.vehicle);
                console.log('🖼️ Available image fields:', {
                    vehicleImage: response.data.data.vehicleImage,
                    vehiclePhoto: response.data.data.documents?.vehiclePhoto,
                    profileImage: response.data.data.profileImage
                });
            }
        } catch (error) {
            console.error('❌ Error fetching car info:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to load car information',
                text2: error.response?.data?.msg || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileInfo();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfileInfo();
        }, [])
    );

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            uploadCarImage(result.assets[0]);
        }
    };

    const uploadCarImage = async (imageAsset) => {
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('user_id');

            if (!authToken || !userId) {
                Toast.show({
                    type: 'error',
                    text1: 'Authentication required',
                    text2: 'Please log in again'
                });
                return;
            }

            const formData = new FormData();
            
            // Ensure proper FormData format for React Native
            const imageFile = {
                uri: imageAsset.uri,
                type: imageAsset.mimeType || imageAsset.type || 'image/jpeg',
                name: imageAsset.fileName || imageAsset.name || `vehicle_${Date.now()}.jpg`,
            };

            // Try different field names that might be expected
            formData.append('vehiclePhoto', imageFile);    // For documents.vehiclePhoto
            formData.append('vehicleImage', imageFile);    // For vehicleImage field
            formData.append('vehicle_image', imageFile);   // Alternative field name
            formData.append('image', imageFile);           // Generic field name

            console.log('📤 Uploading car image:', {
                userId,
                uri: imageAsset.uri,
                type: imageFile.type,
                name: imageFile.name,
                size: imageAsset.fileSize || 'unknown'
            });

            // Try the dedicated upload endpoint first
            let response;
            try {
                response = await axios.put(`${config.baseUrl}/driver/upload/vehicle/${userId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000, // 30 second timeout
                });
            } catch (firstError) {
                console.log('⚠️ First upload endpoint failed, trying alternative:', firstError.response?.status);
                // Fallback to generic update endpoint
                response = await axios.put(`${config.baseUrl}/driver/update/${userId}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000, // 30 second timeout
                });
            }

            if (response.data.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Car image updated successfully!'
                });
                fetchProfileInfo();
            }
        } catch (error) {
            console.error('❌ Error uploading car image:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to upload car image',
                text2: error.response?.data?.msg || error.message
            });
        }
    };

    const handleDeleteCar = () => {
        Alert.alert(
            'Delete Car Information',
            'Are you sure you want to delete your car information? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: deleteCar }
            ]
        );
    };

    const deleteCar = async () => {
        try {
            const authToken = await AsyncStorage.getItem('authToken');
            const userId = await AsyncStorage.getItem('user_id');

            const response = await axios.put(`${config.baseUrl}/driver/update/${userId}`, {
                vehicle: {
                    maker: '',
                    color: '',
                    registrationNumber: ''
                },
                vehicleImage: null
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Car information deleted successfully'
                });
                fetchProfileInfo();
            }
        } catch (error) {
            console.error('❌ Error deleting car:', error);
            Toast.show({
                type: 'error',
                text1: 'Failed to delete car information',
                text2: error.response?.data?.msg || error.message
            });
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{words?.Cars || 'Cars'}</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2ECC71" />
                    <Text style={[styles.loadingText, { color: isDarkTheme ? "#fff" : "#333" }]}>
                        Loading car information...
                    </Text>
                </View>
            ) : userProfile?.vehicle ? (
                <ScrollView style={styles.scrollContainer}>
                    {/* Car Details Card */}
                    <View style={[styles.carCard, { backgroundColor: isDarkTheme ? "#1E293B" : "#fff" }]}>
                        {/* Car Image Section */}
                        <View style={styles.carImageSection}>
                            <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
                                <Image 
                                    source={
                                        userProfile?.documents?.vehiclePhoto ? { uri: userProfile.documents.vehiclePhoto } :
                                        userProfile?.vehicleImage ? { uri: userProfile.vehicleImage } :
                                        carImg
                                    } 
                                    style={styles.carImage} 
                                    resizeMode="cover" 
                                />
                                <View style={styles.imageOverlay}>
                                    <Ionicons name="camera" size={20} color="#fff" />
                                    <Text style={styles.imageOverlayText}>Change Photo</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Car Details Section */}
                        <View style={styles.carDetailsSection}>
                            <Text style={[styles.carModel, { color: isDarkTheme ? "#fff" : "#333" }]}>
                                {userProfile?.vehicle?.yearOfVehicle ? `${userProfile.vehicle.yearOfVehicle} ` : ''}
                                {userProfile?.vehicle?.color} {userProfile?.vehicle?.maker || 'Vehicle'}
                            </Text>

                            {/* Registration Number */}
                            {userProfile?.vehicle?.registrationNumber && (
                                <View style={[styles.registrationBadge, { backgroundColor: isDarkTheme ? "#334155" : "#f8f9fa" }]}>
                                    <Text style={[styles.registrationNumber, { color: isDarkTheme ? "#fff" : "#333" }]}>
                                        {userProfile.vehicle.registrationNumber}
                                    </Text>
                                </View>
                            )}

                            {/* Car Specifications */}
                            <View style={styles.specsContainer}>
                                <View style={[styles.specItem, { backgroundColor: isDarkTheme ? "#334155" : "#f1f5f9" }]}>
                                    <Ionicons name="people-outline" size={18} color="#2ECC71" />
                                    <Text style={[styles.specText, { color: isDarkTheme ? "#cbd5e1" : "#64748b" }]}>4 Seats</Text>
                                </View>
                                <View style={[styles.specItem, { backgroundColor: isDarkTheme ? "#334155" : "#f1f5f9" }]}>
                                    <MaterialCommunityIcons name="fuel" size={18} color="#2ECC71" />
                                    <Text style={[styles.specText, { color: isDarkTheme ? "#cbd5e1" : "#64748b" }]}>Petrol</Text>
                                </View>
                                <View style={[styles.specItem, { backgroundColor: isDarkTheme ? "#334155" : "#f1f5f9" }]}>
                                    <Ionicons name="speedometer-outline" size={18} color="#2ECC71" />
                                    <Text style={[styles.specText, { color: isDarkTheme ? "#cbd5e1" : "#64748b" }]}>Manual</Text>
                                </View>
                            </View>

                            {/* Last Updated */}
                            <Text style={[styles.lastUpdated, { color: isDarkTheme ? "#94a3b8" : "#64748b" }]}>
                                Last updated: {userProfile?.updatedAt ? 
                                    new Date(userProfile.updatedAt).toLocaleDateString("en-US", { 
                                        day: "numeric",
                                        month: "short", 
                                        year: "numeric" 
                                    }) : "Unknown"}
                            </Text>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                    onPress={() => navigation.navigate('profile/vehicle')} 
                                    style={[styles.editButton, { backgroundColor: isDarkTheme ? "#334155" : "#f1f5f9" }]}
                                >
                                    <Ionicons name="create-outline" size={20} color="#2ECC71" />
                                    <Text style={[styles.editButtonText, { color: "#2ECC71" }]}>
                                        {words?.Edit || 'Edit Details'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={handleDeleteCar}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#fff" />
                                    <Text style={styles.deleteButtonText}>
                                        {words?.Delete || 'Delete'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="car-outline" size={64} color="#94a3b8" />
                    <Text style={[styles.emptyText, { color: isDarkTheme ? "#fff" : "#333" }]}>
                        No car information found
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Add your vehicle details to get started
                    </Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('profile/vehicle')}
                        style={styles.addCarButton}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addCarText}>Add Vehicle</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View >
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: '#2ECC71',
        paddingBottom: 15,
        paddingTop: 50,
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
    carCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    carImageSection: {
        height: 200,
        position: 'relative',
    },
    carImage: {
        width: '100%',
        height: '100%',
    },
    carDetailsSection: {
        padding: 20,
    },
    carModel: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    registrationBadge: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    registrationNumber: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
        textAlign: 'center',
    },
    specsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    specText: {
        fontSize: 12,
        fontWeight: '500',
    },
    lastUpdated: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        gap: 8,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // New styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    imageOverlayText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    registrationContainer: {
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    registrationLabel: {
        fontSize: 12,
        marginBottom: 5,
    },
    registrationNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
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
        marginBottom: 24,
    },
    addCarButton: {
        backgroundColor: '#2ECC71',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    addCarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CarsScreen;