import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/core';

const Security = () => {
  const [biometricIdEnabled, setBiometricIdEnabled] = useState(true);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [googleAuthenticatorEnabled, setGoogleAuthenticatorEnabled] = useState(false);
  const navigation = useNavigation();
  const toggleBiometricId = () => {
    setBiometricIdEnabled(!biometricIdEnabled);
    // Implement logic to enable/disable Biometric ID
  };

  const toggleFaceId = () => {
    setFaceIdEnabled(!faceIdEnabled);
    // Implement logic to enable/disable Face ID
  };

  const toggleGoogleAuthenticator = () => {
    setGoogleAuthenticatorEnabled(!googleAuthenticatorEnabled);
    // Implement logic to enable/disable Google Authenticator
  };

  const handleChangePassword = () => {
    // Navigate to the "Change password" screen
    navigation.navigate('home/change-password'); // Assuming you have this route
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
      </View>

      {/* Security Settings List */}
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Biometric ID</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#27AE60' }}
            thumbColor={biometricIdEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleBiometricId}
            value={biometricIdEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Face ID</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#27AE60' }}
            thumbColor={faceIdEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleFaceId}
            value={faceIdEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Google authenticator</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#27AE60' }}
            thumbColor={googleAuthenticatorEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleGoogleAuthenticator}
            value={googleAuthenticatorEnabled}
          />
        </View>

        <TouchableOpacity style={styles.changePasswordItem} onPress={handleChangePassword}>
          <Text style={styles.settingLabel}>Change password</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#777" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  settingsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  changePasswordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default Security;