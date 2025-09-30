import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../hooks/themeContext';

const BottomNavbar = () => {
  const { isDarkTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation()
  const tabs = [
    { link: "home", name: 'Home', icon: <MaterialIcons name="add-home" size={20} color="#8D8C8C" />, activeIcon: <MaterialIcons name="add-home" size={20} color="#2ECC71" /> },
    { link: "home/trips", name: 'Trips', icon: <AntDesign name="car" size={20} color="#8D8C8C" />, activeIcon: <AntDesign name="car" size={20} color="#2ECC71" /> },
    { link: "home/earnings", name: 'Earnings', icon: <MaterialCommunityIcons name="wallet" size={20} color="#8D8C8C" />, activeIcon: <MaterialCommunityIcons name="wallet" size={20} color="#2ECC71" /> },
    { link: "home/profile", name: 'Profile', icon: <FontAwesome5 name="user" size={20} color="#8D8C8C" />, activeIcon: <FontAwesome5 name="user" size={20} color="#2ECC71" /> },
  ];

  return (
    <View style={[
      styles.navContainer,
      {
        backgroundColor: isDarkTheme ? "#0F172A" : "#fff",
        borderTopColor: isDarkTheme ? "#333" : "rgba(0, 0, 0, 0.1)",
        paddingBottom: insets.bottom
      }
    ]}>
      <View style={styles.navBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => {
              setTimeout(() => {
                navigation.navigate(tab?.link === "home/index" ? "home" : tab?.link);
              }, 100);
            }}
          >
            {route?.name === tab?.link ? tab.activeIcon : tab.icon}
            <Text style={{
              textAlign: "center",
              color: route?.name === tab?.link ? "#2ECC71" : isDarkTheme ? "#aaa" : "#8D8C8C",
              fontWeight: "600",
              marginTop: 2,
              fontSize: 12
            }}>
              {tab?.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
});

export default BottomNavbar;
