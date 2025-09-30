import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import BottomNavbar from '../../components/BottomNavbar';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import userImg from '../../assets/images/home/user.png';
import { useTheme } from '../../hooks/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import config from '../../config';

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
];

const translations = {
  English: {
    Earnings: 'Earnings',
    Incentives: 'Incentives',
    Total_earnings: 'Wallet Balance',
    Withdraw: 'Withdraw',
    TopUp: 'Topup',
    Transaction_history: 'Transaction history',
    View_all: 'View all',
    Paid: 'Paid',
    Received: 'Received',
    Today: 'Today',
    Yesterday: 'Yesterday',
  },
  Russian: {
    Earnings: 'Заработки',
    Incentives: 'Бонусы',
    Total_earnings: 'Общий заработок',
    Withdraw: 'Вывести',
    TopUp: 'Пополнить', // Added
    Transaction_history: 'История транзакций',
    View_all: 'Смотреть все',
    Paid: 'Оплачено',
    Received: 'Получено',
    Today: 'Сегодня',
    Yesterday: 'Вчера',
  },
  Ukrainian: {
    Earnings: 'Заробітки',
    Incentives: 'Заохочення',
    Total_earnings: 'Загальний заробіток',
    Withdraw: 'Вивести',
    TopUp: 'Поповнити', // Added
    Transaction_history: 'Історія транзакцій',
    View_all: 'Переглянути всі',
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

const EarningsScreen = () => {
  const words = useLanguage();
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  
  // State for wallet data
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wallet data from backend
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (!authToken) {
        Toast.show({ type: 'error', text1: 'Authentication required' });
        return;
      }

      const response = await axios.get(`${config.baseUrl}/trip/wallet`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 200) {
        setWalletData(response.data.data.wallet);
        setTransactions(response.data.data.recentTransactions || []);
        console.log('✅ Wallet data fetched successfully');
      }

    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load wallet data',
        text2: error.response?.data?.msg || error.message
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  // Fetch data on component mount and focus
  useEffect(() => {
    fetchWalletData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Total Earnings */}
      <View style={styles.totalEarningsContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Feather name="eye-off" size={15} color="#fff" />
          {/* <Ionicons name="wallet" size={20} color="#fff" style={{ marginRight: 5 }} /> */}
          <Text style={styles.totalEarningsLabel}>{words?.Total_earnings || 'Wallet Balance'}</Text>
        </View>
        <Text style={styles.totalEarningsAmount}>
          {loading ? 'Loading...' : `₴${walletData?.balance?.toFixed(2) || '0.00'}`}
        </Text>
        
        {/* Earnings Stats */}
        {walletData && (
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>₴{walletData.todayEarnings?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>This Week</Text>
              <Text style={styles.statValue}>₴{walletData.weekEarnings?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValue}>₴{walletData.monthEarnings?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>

          <TouchableOpacity onPress={() => navigation.navigate("home/withdraw")} style={styles.withdrawButton}>
            <Ionicons name="arrow-up-circle-outline" size={20} color="#2ECC71" style={{ marginRight: 5 }} />
            <Text style={styles.withdrawText}>{words?.Withdraw || 'Withdraw'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("home/topup")} style={styles.withdrawButton}>
            <Ionicons name="arrow-down-circle-outline" size={20} color="#2ECC71" style={{ marginRight: 5 }} />
            <Text style={styles.withdrawText}>{words?.TopUp || 'Topup'}</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Transaction History */}
      <View style={[styles.transactionHistoryContainer, { backgroundColor: isDarkTheme && "#0f172a" }]}>
        <View style={styles.transactionHistoryHeader}>
          <Text style={[styles.transactionHistoryTitle, { color: isDarkTheme && "#fff" }]}>{words?.Transaction_history || 'Transaction history'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("home/history")}>
            <Text style={styles.viewAllText}>{words?.View_all || 'View all'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && transactions.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: isDarkTheme ? "#fff" : "#333", fontSize: 16 }}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={48} color="#94A3B8" />
              <Text style={{ color: isDarkTheme ? "#fff" : "#333", fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>No Transactions Yet</Text>
              <Text style={{ color: "#94A3B8", fontSize: 14, textAlign: 'center', marginTop: 5 }}>Complete trips to start earning money</Text>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <View key={transaction._id || index} style={[styles.transactionItem, { backgroundColor: isDarkTheme && "#1E293B", marginBottom: index == transactions.length - 1 ? 100 : 20 }]}>
                <View style={styles.leftSection}>
                  <View style={[styles.transactionIconBg, { backgroundColor: '#27AE6020' }]}>
                    <Ionicons name="car-outline" size={24} color="#27AE60" />
                  </View>
                  <View>
                    <Text style={[styles.transactionTitle, { color: isDarkTheme && "#fff" }]}>
                      Trip Payment
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.completedAt || transaction.createdAt).toLocaleDateString()} | {new Date(transaction.completedAt || transaction.createdAt).toLocaleTimeString()}
                    </Text>
                    {transaction.tripId && (
                      <Text style={[styles.transactionSubtitle, { color: '#94A3B8' }]}>
                        {transaction.tripId.pickupLocation?.address?.substring(0, 30)}...
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <Text style={[styles.transactionAmount, { color: isDarkTheme ? "#fff" : "#333" }]}>
                    +₴{transaction.breakdown?.driverEarnings?.toFixed(2) || transaction.amount?.toFixed(2)}
                  </Text>
                  <View style={styles.statusContainer}>
                    <Ionicons name="checkmark-circle" size={14} color="#27AE60" style={{ marginRight: 3 }} />
                    <Text style={styles.statusText}>
                      {transaction.status === 'completed' ? 'Received' : transaction.status}
                    </Text>
                  </View>
                  <Text style={[styles.paymentMethod, { color: '#94A3B8' }]}>
                    {transaction.paymentMethod}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

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
    paddingTop: 50, // Adjust for status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  activeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalEarningsContainer: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 20
  },
  totalEarningsLabel: {
    color: '#fff',
    fontSize: 16,
  },
  totalEarningsAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  withdrawButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    flex: 1
  },
  withdrawText: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },
  transactionHistoryContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  transactionHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionHistoryTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  viewAllText: {
    color: '#2ECC71',
    fontSize: 14,
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
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  transactionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  paymentMethod: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});

export default EarningsScreen;