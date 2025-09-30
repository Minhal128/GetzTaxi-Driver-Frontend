import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import userImg from '../../assets/images/home/user.png';
import { useNavigation } from '@react-navigation/core';

const Rate = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRating = (star) => {
    setRating(star);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 20,paddingTop:50 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity style={{ marginRight: 15 }} onPress={() => {navigation.navigate("home"); }}>
          <Ionicons name="chevron-back" size={24} color="#888" />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#333' }}>Rate</Text>
      </View>

      {/* Driver Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
        <Image source={userImg} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>Daniel Jack</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={16} color="#FFC107" style={{ marginRight: 5 }} />
            <Text style={{ color: '#777', marginRight: 5 }}>4.5</Text>
            <Text style={{ color: '#777' }}>| AD65GEJKFK</Text>
          </View>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#E0F7FA', borderRadius: 10, padding: 8, marginRight: 8 }}>
          <Ionicons name="call-outline" size={24} color="#00ACC1" />
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#E6F9E8', borderRadius: 10, padding: 8 }}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      {/* Rating Section */}
      <View style={{ marginBottom: 25 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 10 }}>How's your trip?</Text>
        <Text style={{ color: '#777', marginBottom: 15 }}>Please rate your driver</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRating(star)}>
              <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={40} color="#FFC107" style={{ marginHorizontal: 10 }}/>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback Section */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 10 }}>Write your feedback</Text>
        <TextInput style={{height: 100,borderColor: '#ccc',borderWidth: 1,borderRadius: 8,padding: 10,textAlignVertical: 'top',color: '#333',}} placeholder="Your feedback..." value={feedback} onChangeText={setFeedback} multiline/>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{ backgroundColor: '#E0F7FA', borderRadius: 10, paddingVertical: 15, flex: 1, marginRight: 10, alignItems: 'center' }} onPress={() => {navigation.navigate("home"); }}>
          <Text style={{ color: '#00ACC1', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#2ECC71', borderRadius: 10, paddingVertical: 15, flex: 1, alignItems: 'center' }} onPress={() => {navigation.navigate("home"); }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Rate;