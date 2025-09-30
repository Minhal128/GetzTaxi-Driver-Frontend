import Logo from '../assets/images/auth/logo.png'
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CarImage from '../assets/images/auth/car.png'
import { useNavigation } from '@react-navigation/core';

const { height } = Dimensions.get('window');

const Onboarding = () => {
  const navigation = useNavigation()

  return (


    <View style={styles.container}>


      <View style={styles.logoContainer}>
        <Image source={Logo} />
      </View>

      {/* Sign In Options */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.googleButton}>
          <Image style={{ width: 30, height: 20, marginRight: 13 }} source={{ uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" }} />
          <Text style={[{ color: "#000" }]}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.appleButton}>
          <FontAwesome name="apple" size={20} color="#000" style={styles.socialIcon} />
          <Text style={styles.buttonText}>Sign in with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("login")} style={styles.passwordButton}>
          <Text style={styles.buttonText}>Sign in with password</Text>
        </TouchableOpacity>
      </View>

      {/* Car Image */}
      <Image source={CarImage} style={styles.carImage} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2ECC71', // Green background
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
  },
  buttonsContainer: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButton: {
    backgroundColor: '#27AE60',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  socialIcon: {
    marginRight: 15,
  },
  carImage: {
    width: '100%',
    height: height * 0.3, // Adjust height as needed
  },
});

export default Onboarding;