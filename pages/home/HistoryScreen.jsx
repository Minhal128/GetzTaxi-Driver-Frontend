import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import userImg from '../../assets/images/home/user.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';

const transactionHistory = [
    {
        type: 'Withdrawal',
        date: 'Today | 10:30 AM',
        amount: '₴12,140',
        status: 'Paid',
        icon: 'arrow-down-circle',
        iconColor: '#27AE60',
    },
    {
        name: 'Daniel Jones',
        date: 'Yesterday | 10:30 AM',
        amount: '₴49',
        status: 'Received',
        image: userImg,
        icon: 'arrow-up-circle',
        iconColor: '#27AE60',
    },
    {
        name: 'Angelina Ned',
        date: 'March 3, 2025 | 10:30 AM',
        amount: '₴74',
        status: 'Received',
        image: userImg,
        icon: 'arrow-up-circle',
        iconColor: '#27AE60',
    },
    {
        name: 'Samuel',
        date: 'March 2, 2025 | 10:30 AM',
        amount: '₴25',
        status: 'Received',
        image: userImg,
        icon: 'arrow-up-circle',
        iconColor: '#27AE60',
    },
    {
        name: 'Jeremy',
        date: 'March 3, 2025 | 10:30 AM',
        amount: '₴10',
        status: 'Received',
        image: userImg,
        icon: 'arrow-up-circle',
        iconColor: '#27AE60',
    },
    {
        type: 'Withdrawal',
        date: 'March 3, 2025 | 10:30 AM',
        amount: '₴49',
        status: 'Paid',
        icon: 'arrow-down-circle',
        iconColor: '#27AE60',
    },
];

const translations = {
    English: {
        History: 'History',
        Search_transactions: 'Search transactions',
        Withdrawal: 'Withdrawal',
        Paid: 'Paid',
        Received: 'Received',
        Today: 'Today',
        Yesterday: 'Yesterday',
    },
    Russian: {
        History: 'История',
        Search_transactions: 'Поиск транзакций',
        Withdrawal: 'Вывод средств',
        Paid: 'Оплачено',
        Received: 'Получено',
        Today: 'Сегодня',
        Yesterday: 'Вчера',
    },
    Ukrainian: {
        History: 'Історія',
        Search_transactions: 'Пошук транзакцій',
        Withdrawal: 'Виведення коштів',
        Paid: 'Оплачено',
        Received: 'Отримано',
        Today: 'Сьогодні',
        Yesterday: 'Вчора',
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
const HistoryScreen = () => {
    const words = useLanguage();
    const { isDarkTheme } = useTheme();
    const navigation = useNavigation();
    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme && "#0f172a" }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{words?.History || 'History'}</Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchBarContainer, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={words?.Search_transactions || "Search transactions"}
                    placeholderTextColor="#B0B0B0"
                />
            </View>

            {/* Transaction History List */}
            <ScrollView style={styles.historyList}>
                {transactionHistory.map((transaction, index) => (
                    <View key={index} style={[styles.transactionItem, { backgroundColor: isDarkTheme && "#1E293B" }]}>
                        <View style={styles.leftSection}>
                            {transaction.image ? (
                                <Image source={transaction.image} style={styles.transactionImage} />
                            ) : (
                                <View style={[styles.transactionIconBg, { backgroundColor: `${transaction.iconColor}20` }]}>
                                    <Ionicons name={transaction.icon} size={24} color={transaction.iconColor} />
                                </View>
                            )}
                            <View>
                                <Text style={[styles.transactionTitle, { color: isDarkTheme && "#fff" }]}>{transaction.name || (words?.[transaction.type] || transaction.type)}</Text>
                                <Text style={styles.transactionDate}>{(transaction.date.startsWith('Today') ? words?.Today : (transaction.date.startsWith('Yesterday') ? words?.Yesterday : transaction.date)) || transaction.date}</Text>
                            </View>
                        </View>
                        <View style={styles.rightSection}>
                            <Text style={[styles.transactionAmount, { color: isDarkTheme && "#fff" }]}>{transaction.amount}</Text>
                            <View style={styles.statusContainer}>
                                <Ionicons name="checkmark-circle" size={14} color="#27AE60" style={{ marginRight: 3 }} />
                                <Text style={styles.statusText}>{words?.[transaction.status] || transaction.status}</Text>
                            </View>
                        </View>
                    </View>
                ))}
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
        paddingTop: 50, // Adjust for status bar
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
    searchBarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        margin: 20,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
    historyList: {
        paddingHorizontal: 20,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    transactionIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    transactionDate: {
        color: '#777',
        fontSize: 12,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 3,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#27AE60',
        fontSize: 12,
    },
});

export default HistoryScreen;