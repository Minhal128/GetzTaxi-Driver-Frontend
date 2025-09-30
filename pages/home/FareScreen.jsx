import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/themeContext';
import { useNavigation } from '@react-navigation/core';

const FareScreen = () => {
    const [first, setfirst] = useState(false);
    const { isDarkTheme } = useTheme();
    const navigation = useNavigation();
    const themeStyles = {
        backgroundColor: isDarkTheme ? '#1e293b' : '#F8FAFC',
        text: isDarkTheme ? '#F1F5F9' : '#333',
        subText: isDarkTheme ? '#94A3B8' : '#777',
        card: isDarkTheme ? '#334155' : '#fff',
        modalBackground: isDarkTheme ? '#1f2937' : 'white',
        buttonText: isDarkTheme ? '#1e293b' : '#fff',
    };

    return (
        <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fare calculation</Text>
            </View>

            {/* Delivery Summary */}
            <View style={styles.summarySection}>
                <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Delivery summary</Text>

                <View style={styles.locationRow}>
                    <View style={styles.iconContainer}>
                        <View style={styles.pickupIconBg}>
                            <Ionicons name="location" size={20} color="#2ECC71" />
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.addressText, { color: themeStyles.text }]}>45, Jos Avenue crescent</Text>
                        <Text style={[styles.labelText, { color: themeStyles.subText }]}>Pick up</Text>
                    </View>
                </View>

                <View style={styles.locationRow}>
                    <View style={styles.iconContainer}>
                        <View style={styles.dropoffIconBg}>
                            <Ionicons name="flag" size={20} color="#2ECC71" />
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.addressText, { color: themeStyles.text }]}>210 Cross road junction</Text>
                        <Text style={[styles.labelText, { color: themeStyles.subText }]}>Drop off</Text>
                    </View>
                </View>

                <View style={styles.packageRow}>
                    <View style={styles.iconContainer}>
                        <View style={styles.packageIconBg}>
                            <Ionicons name="cube-outline" size={20} color="#2ECC71" />
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.packageText, { color: themeStyles.text }]}>Medium</Text>
                        <Text style={[styles.labelText, { color: themeStyles.subText }]}>Package type</Text>
                    </View>
                </View>
            </View>

            {/* Delivery Fare */}
            <View style={styles.fareSection}>
                <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Delivery fare</Text>
                <View style={[styles.fareDetails, { backgroundColor: themeStyles.card }]}>
                    <Text style={[styles.fareLabel, { color: themeStyles.text }]}>Delivery payment</Text>
                    <Text style={[styles.fareAmount, { color: themeStyles.text }]}>₴150.56</Text>
                </View>
            </View>

            {/* Receive Payment Button */}
            <TouchableOpacity onPress={() => setfirst(!first)} style={styles.receiveButton}>
                <Text style={styles.receiveButtonText}>Receive payment</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={first} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: themeStyles.modalBackground }]}>
                        <View style={{ backgroundColor: "#14AE5C", borderRadius: 100, padding: 10 }}>
                            <AntDesign name="check" size={30} color="white" />
                        </View>
                        <Text style={[styles.title, { color: themeStyles.text }]}>Payment received</Text>
                        <Text style={[styles.subtitle, { color: themeStyles.subText }]}>Thanks for riding with us.</Text>
                        <TouchableOpacity onPress={() => { setfirst(false); navigation.navigate("home") }} style={styles.confirmButton}>
                            <Text style={{ color: '#fff' }}>Explore more delivery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setfirst(false); navigation.navigate("home") }} style={styles.cancelButton}>
                            <Text style={{ color: '#2ECC71' }}>Not now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 20,
    },
    summarySection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 15,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },
    pickupIconBg: {
        backgroundColor: '#E0F7EF',
        borderRadius: 100,
        padding: 5,
    },
    dropoffIconBg: {
        backgroundColor: '#E0F7EF',
        borderRadius: 100,
        padding: 5,
    },
    packageIconBg: {
        backgroundColor: '#E0F7EF',
        borderRadius: 100,
        padding: 5,
    },
    addressText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    labelText: {
        fontSize: 12,
    },
    packageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    packageText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    fareSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    fareDetails: {
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareLabel: {
        fontSize: 14,
    },
    fareAmount: {
        fontSize: 14,
    },
    receiveButton: {
        backgroundColor: '#2ECC71',
        borderRadius: 8,
        paddingVertical: 15,
        marginHorizontal: 20,
        alignItems: 'center',
    },
    receiveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        borderRadius: 10,
        maxHeight: '90%',
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 40,
    },
    confirmButton: {
        backgroundColor: '#2ECC71',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        width: "100%",
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#2ECC71',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        width: "100%",
        marginTop: 10,
    },
});

export default FareScreen;
