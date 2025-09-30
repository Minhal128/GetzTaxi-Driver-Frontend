import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import carImg from '../../assets/images/home/car3.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import config from '../../config';
import axios from 'axios';

const translations = {
    English: {
        Car_details: 'Car details',
        Car_description: 'Car description',
        Car_name: 'Car name',
        Car_Make: 'Car Make',
        Color: 'Color',
        Number_of_seats: 'Number of seats',
        Fuel_type: 'Fuel type',
        Car_documents: 'Car documents',
        Drivers_license: "Driver's license",
        Vehicle_registration: 'Vehicle registration',
        Vehicle_Plate_number: 'Vehicle Plate number',
        Vehicle_registration_number: 'Vehicle Registration Number',  
    },
    Russian: {
        Car_details: 'Детали автомобиля',
        Car_description: 'Описание автомобиля',
        Car_name: 'Название автомобиля',
        Car_Make: 'Марка автомобиля',
        Color: 'Цвет',
        Number_of_seats: 'Количество мест',
        Fuel_type: 'Тип топлива',
        Car_documents: 'Документы на автомобиль',
        Drivers_license: 'Водительское удостоверение',
        Vehicle_registration: 'Регистрация транспортного средства',
        Vehicle_Plate_number: 'Номерной знак автомобиля',
        Vehicle_registration_number: 'Номер регистрации транспортного средства', 
    },
    Ukrainian: {
        Car_details: 'Деталі автомобіля',
        Car_description: 'Опис автомобіля',
        Car_name: 'Назва автомобіля',
        Car_Make: 'Марка автомобіля',
        Color: 'Колір',
        Number_of_seats: 'Кількість місць',
        Fuel_type: 'Тип палива',
        Car_documents: 'Документи на автомобіль',
        Drivers_license: 'Водійське посвідчення',
        Vehicle_registration: 'Реєстрація транспортного засобу',
        Vehicle_Plate_number: 'Номерний знак автомобіля',
        Vehicle_registration_number: 'Номер реєстрації транспортного засобу', 
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

const CarDetailsScreen = () => {
    const words = useLanguage();
    const { isDarkTheme } = useTheme();
    const [userProfile, setUserProfile] = useState(null);
    const navigation = useNavigation()

    const fetchProfileInfo = async () => {
        try {
            let userId = await AsyncStorage.getItem('user_id');
            let res = await axios.get(`${config.baseUrl}/driver/info/${userId}`);
            if (res?.data?.data) {
                setUserProfile(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProfileInfo();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{words?.Car_details || 'Car details'}</Text>
            </View>

            {/* Car Images Section */}

            <ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageSection}>
                    <View style={[styles.carImageContainer, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <Image source={{uri:userProfile?.vehicle_img}} style={styles.carImage} resizeMode="contain" />
                    </View>
                    <View style={[styles.carImageContainer, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <Image source={{uri:userProfile?.driver_license_img}} style={styles.carImage} resizeMode="contain" />
                    </View>
                    <View style={[styles.carImageContainer, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <Image source={{uri:userProfile?.license_plate_img}} style={styles.carImage} resizeMode="contain" />
                    </View>
                    <View style={[styles.carImageContainer, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <Image source={{uri:userProfile?.vehicle_registration_img}} style={styles.carImage} resizeMode="contain" />
                    </View>
                </ScrollView>

                {/* Car Description Section */}
                <View style={styles.descriptionSection}>
                    <Text style={[styles.sectionTitle, { color: isDarkTheme && "#Fff" }]}>{words?.Car_description || 'Car description'}</Text>
                    <TouchableOpacity style={[styles.detailRow, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View>
                            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>{userProfile?.vehicle_make}</Text>
                            <Text style={styles.detailSublabel}>{words?.Car_name || 'Car name'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.detailRow, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View>
                            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>{userProfile?.vehicle_make?.split(" ")[0] || "none"}</Text>
                            <Text style={styles.detailSublabel}>{words?.Car_Make || 'Car Make'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.detailRow, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View>
                            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>{userProfile?.vehicle_color}</Text>
                            <Text style={styles.detailSublabel}>{words?.Color || 'Color'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.detailRow, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View>
                            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>4</Text>
                            <Text style={styles.detailSublabel}>{words?.Number_of_seats || 'Number of seats'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.detailRow, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View>
                            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>Petrol</Text>
                            <Text style={styles.detailSublabel}>{words?.Fuel_type || 'Fuel type'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.detailRow, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View>
                            <Text style={[styles.detailLabel, { color: isDarkTheme && "#fff" }]}>{userProfile?.vehicle_registration_number}</Text>
                            <Text style={styles.detailSublabel}>{words?.Vehicle_registration_number || 'Vehicle Registration Number'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    imageSection: {
        flexDirection: 'row',
        padding: 20,
    },
    carImageContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginRight: 15,
        width:300,
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
    },
    carImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    addCarImage: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    descriptionSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    detailLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    detailSublabel: {
        color: '#777',
        fontSize: 12,
        marginTop: 2,
    },
    documentsSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 70
    },
    documentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    documentLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
});

export default CarDetailsScreen;