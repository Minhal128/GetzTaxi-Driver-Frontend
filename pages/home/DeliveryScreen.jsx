import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ScrollView } from 'react-native';
import BottomNavbar from '../../components/BottomNavbar';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/core';
const DeliveryScreen = () => {
    const navigation = useNavigation()
    const [pickupLocation, setPickupLocation] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [packageType, setPackageType] = useState('Large');
    const [deliveryType, setDeliveryType] = useState('Express');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [fare, setFare] = useState('₴1,200');

    const handlePackageTypeSelect = (type) => {
        setPackageType(type);
    };

    const handleDeliveryTypeSelect = (type) => {
        setDeliveryType(type);
    }

    const handleRequestDelivery = () => {
        navigation.navigate('home/map');
    };

    return (
        <View style={styles.container}>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>What are you sending today?</Text>

                {/* Location */}
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputContainer}>
                    <View style={styles.iconInputWrapper}>
                        <Ionicons name="radio-button-on-outline" size={20} color="#777" />
                        <TextInput
                            style={{flex:1}}
                            placeholder="Pickup location"
                            value={pickupLocation}
                            onChangeText={setPickupLocation}
                        />
                    </View>
                    <TouchableOpacity style={styles.locationIcon}>
                        <Ionicons name="locate-outline" size={20} color="#777" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.iconInputWrapper}>
                        <Ionicons name="location-outline" size={20} color="#27AE60" />
                        <TextInput
                            style={{flex:1}}
                            placeholder="Delivery address"
                            value={deliveryAddress}
                            onChangeText={setDeliveryAddress}
                        />
                    </View>
                    <TouchableOpacity style={styles.locationIcon}>
                        <Ionicons name="map-outline" size={20} color="#777" />
                    </TouchableOpacity>
                </View>

                {/* Select package type */}
                <Text style={styles.label}>Select package type</Text>
                <View style={styles.packageTypeContainer}>
                    <TouchableOpacity style={[styles.packageOption, packageType === 'Small' && styles.selectedPackage]} onPress={() => handlePackageTypeSelect('Small')}>
                        <Ionicons name="cube-outline" size={30} color={packageType === 'Small' ? '#fff' : '#777'} />
                        <Text style={[styles.packageText, packageType === 'Small' && styles.selectedPackageText]}>Small</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.packageOption, packageType === 'Medium' && styles.selectedPackage]} onPress={() => handlePackageTypeSelect('Medium')}>
                        <Ionicons name="layers-outline" size={30} color={packageType === 'Medium' ? '#fff' : '#777'} />
                        <Text style={[styles.packageText, packageType === 'Medium' && styles.selectedPackageText]}>Medium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.packageOption, packageType === 'Large' && styles.selectedPackage]} onPress={() => handlePackageTypeSelect('Large')}>
                        <Ionicons name="gift-outline" size={30} color={packageType === 'Large' ? '#fff' : '#27AE60'} />
                        <Text style={[styles.packageText, packageType === 'Large' && styles.selectedPackageText]}>Large</Text>
                    </TouchableOpacity>
                </View>

                {/* Select delivery type */}
                <Text style={styles.label}>Select delivery type</Text>
                <View style={styles.deliveryTypeContainer}>
                    <TouchableOpacity
                        style={[styles.deliveryOption, deliveryType === 'Standard' && styles.selectedDelivery]}
                        onPress={() => handleDeliveryTypeSelect('Standard')}
                    >
                        <Text style={[styles.deliveryText, deliveryType === 'Standard' && styles.selectedDeliveryText]}>Standard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.deliveryOption, deliveryType === 'Express' && styles.selectedDelivery]}
                        onPress={() => handleDeliveryTypeSelect('Express')}
                    >
                        <Text style={[styles.deliveryText, deliveryType === 'Express' && styles.selectedDeliveryText]}>Express</Text>
                    </TouchableOpacity>
                </View>

                {/* Recipient's contact details */}
                <Text style={styles.label}>Recipient's contact details</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Recipient's name"
                    value={recipientName}
                    onChangeText={setRecipientName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                />
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Additional notes"
                    multiline
                    value={additionalNotes}
                    onChangeText={setAdditionalNotes}
                />

                {/* Fare calculation */}
                <View style={styles.fareContainer}>
                    <Text style={styles.fareLabel}>Fare calculation</Text>
                    <Text style={styles.fareAmount}>{fare}</Text>
                </View>

                {/* Payment method */}
                <TouchableOpacity style={styles.paymentMethodContainer}>
                    <Text style={styles.paymentMethodLabel}>Payment method</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.paymentMethodValue}>{paymentMethod}</Text>
                        <Ionicons name="chevron-down-outline" size={20} color="#777" />
                    </View>
                </TouchableOpacity>

                {/* Request delivery button */}
                <TouchableOpacity style={styles.requestButton} onPress={handleRequestDelivery}>
                    <Text style={styles.requestButtonText}>Request delivery</Text>
                </TouchableOpacity>

            </ScrollView>

            <BottomNavbar/>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 30
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: '#555',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    iconInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        fontSize: 16,
        backgroundColor:"#F8FAFC",
        marginBottom:10,
        paddingHorizontal:10,
        borderRadius:5,
        height:50,

    },
    locationIcon: {
        padding: 10,
    },
    packageTypeContainer: {
        flexDirection: 'row',
        justifyContent:'space-between',
        marginBottom: 15,
    },
    packageOption: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        width:100,
    },
    selectedPackage: {
        backgroundColor: '#27AE60',
    },
    packageText: {
        marginTop: 5,
        fontSize: 14,
        color: '#777',
    },
    selectedPackageText: {
        color: '#fff',
    },
    deliveryTypeContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    deliveryOption: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginRight: 10,
    },
    selectedDelivery: {
        backgroundColor: '#27AE60',
    },
    deliveryText: {
        fontSize: 16,
        color: '#777',
    },
    selectedDeliveryText: {
        color: '#fff',
    },
    notesInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    fareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10,
    },
    fareLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    fareAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    paymentMethodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 20,
    },
    paymentMethodLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    paymentMethodValue: {
        fontSize: 16,
        color: '#333',
        marginRight: 5,
    },
    requestButton: {
        backgroundColor: '#27AE60',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom:50
    },
    requestButtonText: {
        color: '#fff',
    },
});

export default DeliveryScreen;