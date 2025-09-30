import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/apiService';

import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import Toast from 'react-native-toast-message';
import config from '../config';
import { useNavigation } from '@react-navigation/core';
import socketService from '../services/socketService';

const Otp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [timer, setTimer] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigation = useNavigation()
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer > 0) {
                    return prevTimer - 1;
                } else {
                    clearInterval(interval);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        if (timer === 0) {
            console.log('OTP timer expired');
        }
    }, [timer]);

    const handleInputChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value.length === 1 && index < otp.length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (index, nativeEvent) => {
        if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleProceed = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            Toast.show({ type: 'error', text1: 'Please enter 6-digit OTP' });
            return;
        }

        if (isVerifying) {
            console.log('⚠️ OTP verification already in progress, ignoring duplicate call');
            return;
        }

        setIsVerifying(true);
        try {
            const phone_number = await AsyncStorage.getItem("phone_number");
            const isSignupFlow = await AsyncStorage.getItem("signup_flow");
            
            const response = await authAPI.verifyOtp(phone_number, enteredOtp);

            console.log('OTP Verification Response:', response.data);
            const { code, msg, data } = response.data;

            if (code === 200) {
                Toast.show({ type: 'success', text1: msg || 'OTP verified successfully' });
                await AsyncStorage.removeItem("phone_number");
                
                // Prevent any further execution after successful verification
                setIsVerifying(false);
                
                const isLoginFlow = await AsyncStorage.getItem("login_flow");
                
                if (isSignupFlow === "true") {
                    // New signup flow - go directly to account setup
                    await AsyncStorage.removeItem("signup_flow");
                    await AsyncStorage.setItem("verified_phone", phone_number);
                    
                    // Store basic user info for account setup
                    if (data && data._id) {
                        await AsyncStorage.setItem("user_id", data._id);
                        await AsyncStorage.setItem("userProfile", JSON.stringify({ data }));
                    }
                    
                    navigation.navigate("profile/name");
                    return; // Exit function immediately after navigation
                } else if (isLoginFlow === "true") {
                    // Login flow - existing user logging in
                    await AsyncStorage.removeItem("login_flow");
                    
                    // Validate data exists before storing
                    if (data && data._id && data.token) {
                        // Store user data and token
                        await AsyncStorage.setItem("language", "English");
                        await AsyncStorage.setItem("user_id", data._id);
                        await AsyncStorage.setItem("authToken", data.token);
                        await AsyncStorage.setItem("userProfile", JSON.stringify({ data }));
                        
                        // Connect to socket service
                        socketService.connect();
                        
                        console.log('Login flow - User profile data:', {
                            profileComplete: data.profileComplete,
                            hasFirstName: !!data.firstName,
                            hasLastName: !!data.lastName,
                            hasFullName: !!data.fullName,
                            hasCity: !!data.city,
                            hasPaymentMethod: !!data.paymentMethod,
                            hasEmail: !!data.email,
                            isVerified: data.isVerified,
                            fullName: data.fullName,
                            city: data.city,
                            paymentMethod: data.paymentMethod
                        });
                        
                        // For login flow, check multiple indicators of profile completion
                        const hasBasicProfile = data.firstName && data.lastName;
                        const hasFullName = data.fullName && data.fullName.trim().length > 0;
                        const hasCity = data.city && data.city.trim().length > 0;
                        const hasPaymentMethod = data.paymentMethod && data.paymentMethod.trim().length > 0;
                        const hasAnyNameData = hasBasicProfile || hasFullName;
                        
                        // Check if user has substantial profile data (name + location + payment)
                        const hasSubstantialProfile = hasAnyNameData && (hasCity || hasPaymentMethod);
                        
                        // For existing users logging in, if they have substantial profile data, 
                        // consider profile complete regardless of the flag
                        const isProfileComplete = data.profileComplete === true || hasSubstantialProfile;
                        
                        console.log('Profile completion check:', {
                            hasBasicProfile,
                            hasFullName,
                            hasCity,
                            hasPaymentMethod,
                            hasAnyNameData,
                            hasSubstantialProfile,
                            profileCompleteFlag: data.profileComplete,
                            finalDecision: isProfileComplete
                        });
                        
                        if (isProfileComplete) {
                            console.log('✅ Navigating to home - existing user with complete profile');
                            navigation.navigate("home");
                        } else {
                            console.log('⚠️ Navigating to profile setup - existing user needs to complete profile');
                            navigation.navigate("profile/name");
                        }
                        return; // Exit function immediately after navigation
                    } else {
                        console.error('Invalid user data received:', data);
                        Toast.show({ 
                            type: 'error', 
                            text1: 'Login Error',
                            text2: 'Invalid user data received. Please try again.'
                        });
                    }
                } else {
                    // Existing flow - go back to login
                    navigation.navigate("login");
                    return; // Exit function immediately after navigation
                }
            } else {
                Toast.show({ 
                    type: 'error', 
                    text1: 'Verification Failed',
                    text2: msg || 'Invalid OTP. Please try again.'
                });
            }
        } catch (error) {
            console.error('OTP Verification Error:', error);
            console.error('Error Response:', error?.response?.data);
            console.error('Error Status:', error?.response?.status);
            
            const errorData = error?.response?.data;
            let errorMessage = 'Error verifying OTP';
            
            if (error?.response?.status === 400) {
                errorMessage = errorData?.msg || 'Invalid OTP or request format';
            } else if (error?.response?.status === 404) {
                errorMessage = 'OTP verification endpoint not found';
            } else if (error?.response?.status === 500) {
                errorMessage = 'Server error. Please try again later';
            } else if (errorData?.msg) {
                errorMessage = errorData.msg;
            }
            
            Toast.show({ 
                type: 'error', 
                text1: 'Verification Failed',
                text2: errorMessage
            });
        } finally {
            setIsVerifying(false);
        }
    };


    const handleResend = async () => {
        if (timer > 0) {
            Toast.show({ type: 'info', text1: `Please wait ${timer}s before resending` });
            return;
        }

        try {
            const phone_number = await AsyncStorage.getItem("phone_number");
            const isSignupFlow = await AsyncStorage.getItem("signup_flow");
            const isLoginFlow = await AsyncStorage.getItem("login_flow");
            
            if (!phone_number) {
                Toast.show({ type: 'error', text1: 'Phone number not found. Please go back and try again.' });
                return;
            }
            
            // Determine the correct OTP type based on the flow
            let otpType = "registration"; // default
            if (isLoginFlow === "true") {
                otpType = "login";
            } else if (isSignupFlow === "true") {
                otpType = "registration";
            }

            console.log('Resending OTP with type:', otpType, 'for phone:', phone_number);
            const response = await authAPI.sendOtp(phone_number, otpType);
            console.log('Resend OTP Response:', response);
            const { code, msg } = response;
            if (code === 200) {
                Toast.show({ type: 'success', text1: msg });
                setTimer(60);
                setOtp(['', '', '', '', '', '']);
                if (inputRefs.current[0]) inputRefs.current[0].focus();
            } else {
                Toast.show({ type: 'error', text1: msg || 'Failed to resend OTP' });
            }
        } catch (error) {
            const { msg } = error?.response?.data || {};
            Toast.show({ type: 'error', text1: msg || 'Error resending OTP' });
        }
    };


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>Enter the OTP code sent to your mobile number</Text>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput key={index} style={styles.otpInput} maxLength={1} keyboardType="number-pad" value={digit} onChangeText={(text) => handleInputChange(index, text)} onKeyPress={(nativeEvent) => handleKeyPress(index, nativeEvent)} ref={(ref) => (inputRefs.current[index] = ref)} autoFocus={index === 0} />
                ))}
            </View>

            <Text style={styles.timer}>{formatTime(timer)}</Text>

            <TouchableOpacity 
                style={[styles.proceedButton, isVerifying && styles.disabledButton]} 
                onPress={handleProceed}
                disabled={isVerifying}
            >
                <Text style={styles.proceedButtonText}>
                    {isVerifying ? 'Verifying...' : 'Proceed'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                <Text style={[styles.resendText, timer > 0 && styles.disabledResendText]}>Didn't receive any code? <Text style={styles.resendLink}>Resend</Text></Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 30,
        paddingTop: 60
    },
    content: {
        // width: '100%',
        // maxWidth: 400,
        // alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        color: '#777',
        fontSize: 16,
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        width: '80%',
    },
    otpInput: {
        width: 45,
        height: 45,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 5,
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },
    timer: {
        color: '#ff6b6b',
        fontSize: 18,
        marginBottom: 20,
    },
    proceedButton: {
        backgroundColor: '#2ecc71',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    proceedButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        alignItems: 'center',
    },
    resendText: {
        color: '#777',
        fontSize: 16,
    },
    resendLink: {
        color: '#2ecc71',
        fontWeight: 'bold',
    },
    disabledResendText: {
        color: '#ccc',
    },
    disabledButton: {
        backgroundColor: '#95a5a6',
        opacity: 0.7,
    },
});

export default Otp;