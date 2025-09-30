import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Removed SvgUri import for better performance
import Toast from 'react-native-toast-message';
import Logo from '../assets/images/splash-icon2.png';
import CountryCodeModal from '../components/CountryCodeModal';
import { useNavigation } from '@react-navigation/core';
import { authAPI } from '../services/apiService';

const greenColor = '#34BF02';
const googleIconSource = { uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" };

const Register = () => {
    // Fast emoji flag conversion function
    const getEmojiFlag = (countryCode) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState({ 
        name: 'America', 
        dial_code: '+1', 
        code: 'US',
        flag: '🇺🇸'
    });
    const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const handleSignIn = () => {
        navigation.navigate("login")
    };

    const handleSignUp = async () => {
        const fullPhoneNumber = selectedCountryCode.dial_code + phoneNumber;

        if (!phoneNumber) {
            Toast.show({ type: 'error', text1: 'Phone number is required' });
            return;
        }

        const validPhone = /^\d{9,13}$/;
        if (!validPhone.test(phoneNumber)) {
            Toast.show({ type: 'error', text1: 'Invalid phone number format' });
            return;
        }

        setIsLoading(true);
        try {
            // Clear any existing user data before registration
            await AsyncStorage.multiRemove([
                'authToken',
                'user_id', 
                'userProfile',
                'language',
                'login_flow'
            ]);
            console.log('🧹 Cleared previous user data before registration');
            
            console.log('Sending OTP to:', fullPhoneNumber);
            // Send OTP for phone verification
            const response = await authAPI.sendOtp(fullPhoneNumber, 'registration');
            console.log('OTP response:', response);

            if (response.code === 200) {
                Toast.show({ type: 'success', text1: 'OTP sent successfully!' });
                await AsyncStorage.setItem("phone_number", fullPhoneNumber);
                await AsyncStorage.setItem("signup_flow", "true");
                
                setTimeout(() => {
                    navigation.navigate("otp");
                }, 1500);
            }
        } catch (error) {
            console.error('OTP sending error:', error);
            
            const errorData = error?.response?.data;
            let errorMessage = 'Failed to send OTP. Please try again.';
            
            if (error?.message?.includes('Network Error')) {
                errorMessage = 'Cannot connect to server. Please check your connection.';
            } else if (errorData?.msg) {
                errorMessage = errorData.msg;
            }
            
            Toast.show({ 
                type: 'error', 
                text1: 'OTP Failed',
                text2: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        console.log('Sign in with Google');
    };

    const handleAppleSignIn = () => {
        console.log('Sign in with Apple');
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

    return (
        <View style={styles.container}>




            <View style={{ backgroundColor: "#34BF02", height: 220, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
                <View style={styles.logoContainer}>
                    <Image source={Logo} style={{ height: 100, width: 200 }} />
                </View>
            </View>



            <View style={{ paddingHorizontal: 10, backgroundColor: "#fff", position: "absolute", top: 150, left: 20, right: 20, borderRadius: 10 }}>

                {/* Welcome Text */}
                <Text style={styles.welcomeText}>Get Started</Text>
                <Text style={styles.subtitle}>Enter your phone number to receive OTP</Text>


                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10 }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: "#F8FAFC", padding: 10, borderRadius: 7 }} onPress={toggleCountryModal}>
                        <Text style={{ fontSize: 20 }}>
                            {selectedCountryCode?.flag || '🇺🇸'}
                        </Text>
                        <Text style={{ fontSize: 16, color: '#333', marginLeft: 10 }}>{selectedCountryCode.dial_code}</Text>
                    </TouchableOpacity>
                    <TextInput placeholderTextColor={"#000"} style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: "#F8FAFC", padding: 10, borderRadius: 7 }} placeholder="Phone number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
                </View>


                {/* Sign Up Button */}
                <TouchableOpacity 
                    style={[styles.signInButton, { backgroundColor: greenColor, opacity: isLoading ? 0.7 : 1 }]} 
                    onPress={handleSignUp}
                    disabled={isLoading}
                >
                    <Text style={styles.signInText}>
                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                </TouchableOpacity>

                {/* Sign in with Google */}
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
                    <Image source={googleIconSource} style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Sign up with Google</Text>
                </TouchableOpacity>

                {/* Sign in with Apple */}
                <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
                    <FontAwesome name="apple" size={20} color="black" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Sign up with Apple</Text>
                </TouchableOpacity>

                {/* Don't have an account */}
                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>Already have an account?</Text>
                    <TouchableOpacity onPress={handleSignIn}>
                        <Text style={[styles.bottomText, { color: greenColor, fontWeight: 'bold' }]}> Sign In</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ textAlign: "center", marginVertical: 20, color: "#64748B" }}>By signing up, you agree to our <Text style={{ fontWeight: "bold" }}>Terms & conditions</Text>  and acknowledge our <Text style={{ fontWeight: "bold" }}>Privacy Policy</Text></Text>
            </View>

            <CountryCodeModal isVisible={isCountryModalVisible} onClose={toggleCountryModal} onSelect={handleCountrySelect} />



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
        marginBottom: 70,
    },
    logoText: {
        color: '#34BF02',
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
        marginBottom: 30,
        textAlign: 'center',
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

export default Register;