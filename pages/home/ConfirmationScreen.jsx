import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/themeContext';

const ConfirmationScreen = () => {
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme && "#1e293b" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkTheme && "#fff" }]}>Delivery confirmation</Text>
      </View>

      {/* Upload Delivery Photo */}
      <View style={[styles.uploadSection]}>
        <Text style={[styles.sectionTitle, { color: isDarkTheme && "#fff" }]}>Upload delivery photo</Text>
        <View style={[styles.uploadButtonsContainer]}>
          <TouchableOpacity style={[styles.uploadButton, { backgroundColor: isDarkTheme && "#0F172A", borderWidth: 0 }]}>
            <Ionicons name="cloud-upload-outline" size={30} color={isDarkTheme ? "#fff" : "#333"} style={styles.uploadIcon} />
            <Text style={[styles.uploadText, { color: isDarkTheme && "#fff" }]}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.uploadButton, { backgroundColor: isDarkTheme && "#0F172A", borderWidth: 0 }]}>
            <Ionicons name="cloud-upload-outline" size={30} color={isDarkTheme ? "#fff" : "#333"} style={styles.uploadIcon} />
            <Text style={[styles.uploadText, { color: isDarkTheme && "#fff" }]}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipient's Signature */}
      <View style={styles.signatureSection}>
        <Text style={[styles.sectionTitle, { color: isDarkTheme && "#fff" }]}>Recipient's signature</Text>
        <View style={[styles.signatureBox, { backgroundColor: isDarkTheme && "#0F172A", borderWidth: 0 }]}>
          <Text style={[styles.signaturePlaceholder]}>Sign here</Text>
        </View>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity onPress={() => navigation.navigate("home/fare")} style={styles.proceedButton}>
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
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
  uploadSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 20
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  uploadIcon: {
    marginBottom: 5,
  },
  uploadText: {
    color: '#777',
    fontSize: 14,
  },
  signatureSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  signatureBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signaturePlaceholder: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  proceedButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ConfirmationScreen;