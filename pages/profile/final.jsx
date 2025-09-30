import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // ✅ using react-native-vector-icons
import { useNavigation } from '@react-navigation/core';

const Final = () => {
  const greenColor = '#2ECC71';
  const navigation = useNavigation();

  const handleBookRide = () => {
    navigation.navigate("home"); // ✅ correct navigation to home screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[styles.circle, { backgroundColor: greenColor }]}>
          <Icon name="check-circle" size={70} color="white" /> 
          {/* ✅ updated icon */}
        </View>
      </View>

      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>Your account has been created</Text>

      <TouchableOpacity
        style={[styles.bookRideButton, { backgroundColor: greenColor }]}
        onPress={handleBookRide}
      >
        <Text style={styles.bookRideText}>Let's explore</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#777',
    textAlign: 'center',
    marginBottom: 40,
  },
  bookRideButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  bookRideText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Final;
