import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons  from 'react-native-vector-icons';
import { useNavigation } from '@react-navigation/core';

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [selectedLocation, setSelectedLocation] = useState('Home');
  const favoriteLocations = [
    { id: 'home', name: 'Home', address: '364 Stillwater, Ave, Malborne' },
    { id: 'office', name: 'Office', address: '55, Summerhouse, FL 32703' },
    { id: 'store', name: 'Store', address: 'Hollywood, United Ave 345' },
  ];

  const handleSelectLocation = (id) => {
    setSelectedLocation(id);
  };

  const handleAddNewLocation = () => {
    console.log('Add new location pressed');
    navigation.goBack()
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Favorite location</Text>
      </View>

      {/* Favorite Location List */}
      {favoriteLocations.map((location) => (
        <TouchableOpacity
          key={location.id}
          style={[
            styles.locationItem,
            selectedLocation === location.id && styles.selectedLocationItem,
          ]}
          onPress={() => handleSelectLocation(location.id)}
        >
          <View style={styles.locationIcon}>
            <Ionicons name="location-sharp" size={24} color="#fff" />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.address}</Text>
          </View>
          {selectedLocation === location.id ? (
            <Ionicons name="checkmark-circle-sharp" size={24} color="#27AE60" />
          ) : (
            <View style={styles.radioOuter}>
              <View style={styles.radioInner} />
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Add New Location Button */}
      <TouchableOpacity style={styles.addLocationButton} onPress={handleAddNewLocation}>
        <Text style={styles.addLocationText}>Add new location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:30
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
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLocationItem: {
    backgroundColor: '#f9f9f9',
  },
  locationIcon: {
    backgroundColor: '#27AE60',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#777',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  addLocationButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  addLocationText: {
    color: '#fff',
  },
});

export default FavoriteScreen;