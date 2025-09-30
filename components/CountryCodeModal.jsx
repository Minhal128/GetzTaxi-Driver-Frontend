import { useState, useMemo, useCallback } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { codes } from "../constants/CountryCodes";

// Fast emoji flag conversion function
const getEmojiFlag = (countryCode) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

const CountryCodeModal = ({ isVisible, onClose, onSelect }) => {
    const [searchText, setSearchText] = useState('');

    // Memoized render function for better performance
    const renderCountryItem = useCallback(({ item }) => {
        return (
            <TouchableOpacity 
                style={styles.countryItem} 
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.flagEmoji}>{getEmojiFlag(item.code)}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.dialCode}>{item.dial_code}</Text>
            </TouchableOpacity>
        );
    }, [onSelect]);

    // Memoized filtered countries for better performance
    const filteredCountries = useMemo(() => {
        if (!searchText.trim()) return codes;
        const searchLower = searchText.toLowerCase();
        return codes.filter(country =>
            country.name.toLowerCase().includes(searchLower) ||
            country.dial_code.includes(searchText)
        );
    }, [searchText]);

    return (
        <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <AntDesign name="arrowleft" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Your Country</Text>
                </View>
                <TextInput
                    style={styles.searchCountryInput}
                    placeholder="Enter Country Name"
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor={"#8f8f8f"}
                />
                <FlatList
                    data={filteredCountries}
                    renderItem={renderCountryItem}
                    keyExtractor={(item) => item.code}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                    initialNumToRender={15}
                    getItemLayout={(data, index) => ({
                        length: 60,
                        offset: 60 * index,
                        index,
                    })}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    searchCountryInput: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 10,
        marginHorizontal: 20,
        color: "#000"
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#eee',
        height: 60,
    },
    flagEmoji: {
        fontSize: 24,
        width: 32,
        textAlign: 'center',
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        color: '#000',
    },
    dialCode: {
        fontSize: 16,
        color: 'gray',
        fontWeight: '500',
    },
});

export default CountryCodeModal;
