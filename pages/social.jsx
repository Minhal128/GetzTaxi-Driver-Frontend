import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Logo from '../assets/images/auth/logo.png'
import { useNavigation } from '@react-navigation/core';


const Social = () => {
    const [email, setEmail] = useState('');
    const greenColor = '#2ECC71';
    const googleIconSource = { uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" };
    const navigation = useNavigation()
    
    const handleSignIn = () => {
        navigation.navigate("otp")
    };

    const handleSignUp = () => {
        navigation.navigate("login")
    };

    const handleGoogleSignIn = () => {
    };

    const handleAppleSignIn = () => {
    };

    return (
        <View style={styles.container}>




            <View style={{ backgroundColor: "#2ECC71", height: 220, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
                <View style={styles.logoContainer}>
                    <Image source={Logo} />
                </View>
            </View>



            <View style={{ paddingHorizontal: 10, backgroundColor: "#fff", position: "absolute", top: 150, left: 20, right: 20, borderRadius: 10, height: 580 }}>

                {/* Welcome Back Text */}
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.subtitle}>Your journey starts here!</Text>


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

                {/* Sign in with Apple */}
                <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
                    <FontAwesome name="facebook" size={20} color="#2652FF" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Sign in with Facebook</Text>
                </TouchableOpacity>

                {/* Don't have an account */}
                <View style={styles.bottomContainer}>
                    <Text style={styles.bottomText}>Already have an account?</Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={[styles.bottomText, { color: greenColor, marginLeft: 6 }]}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>


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
        marginBottom: 50,
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
        marginTop: 60
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

export default Social;