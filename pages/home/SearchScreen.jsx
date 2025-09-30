import { useNavigation } from '@react-navigation/core';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SearchScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20,paddingTop:50,}}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={()=>navigation.navigate("home")} style={{ marginRight: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#888" />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#333' }}>Search</Text>
      </View>

      {/* Search Input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 }}>
        <Ionicons name="search" size={20} color="#888" marginRight={10} />
        <TextInput
          style={{ flex: 1, height: 45, color: '#555' }}
          placeholder="Search"
        />
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="options-outline" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Recent Search Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>Recent search</Text>
        <TouchableOpacity>
          <Text style={{ color: '#2ECC71' }}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Search List */}
      <ScrollView>
        {[
          { name: 'Fashion Store', address: '45, Jos Avenue 34 Crescent', distance: '11.1 km' },
          { name: 'Grocery store', address: '45, Jos Avenue 34 Crescent', distance: '7.4 km' },
          { name: 'Events Center', address: '45, Jos Avenue 34 Crescent', distance: '6.0 km' },
          { name: 'Crunchies', address: '45, Jos Avenue 34 Crescent', distance: '13.7 km' },
          { name: 'Ice', address: '45, Jos Avenue 34 Crescent', distance: '13 km' },
          { name: 'Fashion Store', address: '45, Jos Avenue 34 Crescent', distance: '13.1 km' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Ionicons name="time-outline" size={20} color="#888" marginRight={15} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.name}</Text>
              <Text style={{ color: '#777', fontSize: 12 }}>{item.address}</Text>
            </View>
            <Text style={{ color: '#777', fontSize: 12 }}>{item.distance}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;