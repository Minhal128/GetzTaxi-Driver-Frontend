import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useTheme } from '../../hooks/themeContext';
import { useNavigation } from '@react-navigation/core';

const EditScreen = () => {
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();
  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? "#0f172a" : "#fff" }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>Edit profile</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={40} color="#777" />
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Oliver Sandra</Text>
      </View>

      {/* Edit Fields */}
      <TouchableOpacity style={styles.editField}>
        <View>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>Oliver Sandra</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#777" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.editField}>
        <View>
          <Text style={styles.label}>Email address</Text>
          <Text style={styles.value}>Sandrabon@gmail.com</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#777" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.editField}>
        <View>
          <Text style={styles.label}>Phone number</Text>
          <Text style={styles.value}>+124356678</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#777" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.editField}>
        <View>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>United States</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#777" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.editField}>
        <View>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>Female</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#777" />
      </TouchableOpacity>

      {/* Add New Location Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.addLocationButton}>
        <Text style={styles.addLocationText}>Add new location</Text>
      </TouchableOpacity>
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
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  profileInfo: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#27AE60',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
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
    fontSize: 18,
  },
});

export default EditScreen;