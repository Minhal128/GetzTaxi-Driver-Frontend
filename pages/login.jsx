import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// Removed SvgUri import for better performance
import Toast from 'react-native-toast-message';
import Logo from '../assets/images/splash-icon2.png';
import CountryCodeModal from '../components/CountryCodeModal';
import { useNavigation } from '@react-navigation/core';
import { authAPI } from '../services/apiService';
import socketService from '../services/socketService';

const Login = () => {
    const navigation = useNavigation()
    const [phoneNumber, setPhoneNumber] = useState('');
    // Fast emoji flag conversion function
    const getEmojiFlag = (countryCode) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    const [selectedCountryCode, setSelectedCountryCode] = useState({ 
        name: 'America', 
        dial_code: '+1', 
        code: 'US',
        flag: '🇺🇸'
    });
    const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const greenColor = '#34BF02';
    const googleIconSource = { uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" };

    const handleSendOtp = async () => {
        const fullPhoneNumber = selectedCountryCode.dial_code + phoneNumber;

        if (!phoneNumber) {
            Toast.show({ type: "error", text1: "Please enter your phone number" });
            return;
        }

        // Basic phone number validation
        const validPhone = /^\d{9,13}$/;
        if (!validPhone.test(phoneNumber)) {
            Toast.show({ type: "error", text1: "Please enter a valid phone number" });
            return;
        }

        setIsLoading(true);
        try {
            // Clear any existing user data before login
            await AsyncStorage.multiRemove([
                'authToken',
                'user_id', 
                'userProfile',
                'language',
                'signup_flow'
            ]);
            console.log('🧹 Cleared previous user data before login');
            console.log('Sending OTP to:', fullPhoneNumber);
            const response = await authAPI.sendOtp(fullPhoneNumber, 'login');
            console.log('Send OTP Response:', response);
            
            if (response.code === 200) {
                Toast.show({ type: "success", text1: "OTP sent successfully!" });
                
                // Store phone number and login flow flag for OTP screen
                await AsyncStorage.setItem("phone_number", fullPhoneNumber);
                await AsyncStorage.setItem("login_flow", "true");
                console.log('Stored phone number:', fullPhoneNumber);
                console.log('Set login_flow flag to true');
                
                // Navigate to OTP screen
                setTimeout(() => {
                    navigation.navigate("otp");
                }, 1500);
            }
        } catch (error) {
            const errorData = error?.response?.data;
            let errorMessage = errorData?.msg || "Failed to send OTP. Please try again.";
            
            // Handle specific error cases
            if (error?.response?.status === 404) {
                errorMessage = "Phone number not registered. Please sign up first.";
                // Optionally redirect to register page
                setTimeout(() => {
                    Toast.show({
                        type: "info",
                        text1: "Redirecting to Sign Up",
                        text2: "Creating account for new user..."
                    });
                    navigation.navigate("register");
                }, 2000);
            } else if (error?.response?.status === 400 && errorData?.msg?.includes("not verified")) {
                errorMessage = "Account not verified. Please complete registration first.";
            }
            
            Toast.show({ 
                type: "error", 
                text1: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };


    const toggleCountryModal = () => {
        setIsCountryModalVisible(!isCountryModalVisible);
    };

    const handleCountrySelect = (country) => {
        const countryWithFlag = {
            ...country,
            flag: getEmojiFlag(country.code)
        };
        setSelectedCountryCode(countryWithFlag);
        setIsCountryModalVisible(false);
    };


    const handleForgotPassword = () => {
        navigation.navigate("forgot")
    };

    const handleSignUp = () => {
        navigation.navigate("register")
    };

    const handleGoogleSignIn = () => {
        Toast.show({ type: "info", text1: "Google Sign-In is not yet implemented." });
    };

    const handleAppleSignIn = () => {
        Toast.show({ type: "info", text1: "Apple Sign-In is not yet implemented." });
    };

    return (
        <View style={styles.container}>




            <View style={{ backgroundColor: "#34BF02", height: 220, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
                <View style={styles.logoContainer}>
                    <Image source={Logo} style={{ height: 100, width: 200 }} />
                </View>
            </View>



            <View style={{ paddingHorizontal: 10, backgroundColor: "#fff", position: "absolute", top: 180, left: 20, right: 20, borderRadius: 10 }}>

                {/* Welcome Text */}
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subtitle}>Enter your phone number to continue</Text>
                
                {/* Phone Number Input with Country Code */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10 }}>
                    <TouchableOpacity 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            paddingHorizontal: 12, 
                            borderWidth: 1, 
                            borderColor: '#E2E8F0', 
                            backgroundColor: "#F8FAFC", 
                            padding: 10, 
                            borderRadius: 7 
                        }} 
                        onPress={toggleCountryModal}
                    >
                        <Text style={{ fontSize: 20 }}>
                            {selectedCountryCode?.flag || '🇺🇸'}
                        </Text>
                        <Text style={{ fontSize: 16, color: '#333', marginLeft: 10 }}>
                            {selectedCountryCode.dial_code}
                        </Text>
                    </TouchableOpacity>
                    <TextInput 
                        placeholderTextColor={"#000"} 
                        style={{ 
                            flex: 1, 
                            height: 48, 
                            paddingHorizontal: 12, 
                            fontSize: 16, 
                            borderWidth: 1, 
                            borderColor: '#E2E8F0', 
                            backgroundColor: "#F8FAFC", 
                            padding: 10, 
                            borderRadius: 7 
                        }} 
                        placeholder="Phone number" 
                        keyboardType="phone-pad" 
                        value={phoneNumber} 
                        onChangeText={setPhoneNumber} 
                    />
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity 
                    style={[styles.signInButton, { backgroundColor: greenColor, opacity: isLoading ? 0.7 : 1 }]} 
                    onPress={handleSendOtp}
                    disabled={isLoading}
                >
                    <Text style={styles.signInText}>
                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Or */}
                <Text style={styles.orText}>Or</Text>

                {/* Sign in with Google */}
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
                    <Image source={googleIconSource} style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Sign in with Google</Text>
                </TouchableOpacity>

                {/* Sign in with Apple */}
                <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
                    <FontAwesome name="apple" size={20} color="black" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Sign in with Apple</Text>
                </TouchableOpacity>

                {/* Don't have an account */}
                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={[styles.bottomText, { color: greenColor, fontWeight: 'bold' }]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Country Code Modal */}
            <CountryCodeModal
                isVisible={isCountryModalVisible}
                onClose={toggleCountryModal}
                onSelect={handleCountrySelect}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        justifyContent: 'space-between',
        position: "relative"
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoText: {
        color: '#2ECC71',
        fontSize: 32,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginTop: 30
    },
    subtitle: {
        color: 'gray',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    phoneDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9ff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    phoneText: {
        color: '#2ECC71',
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
        flex: 1,
    },
    editButton: {
        padding: 5,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    resendText: {
        color: 'gray',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    icon: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        color: '#000',
        fontSize: 16,
        paddingVertical: 15,
    },
    signInButton: {
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    signInText: {
        color: '#fff',
    },
    forgotPasswordText: {
        color: '#000',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    orText: {
        color: 'gray',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        paddingVertical: 15,
        marginBottom: 15,
        justifyContent: 'center',
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 15,
    },
    socialButtonText: {
        color: '#000',
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    bottomText: {
        color: 'gray',
        fontSize: 16,
    },
});

export default Login;