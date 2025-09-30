import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

/**
 * Debug utility to test API endpoints and find working ones
 */
export const testApiEndpoints = async () => {
  const authToken = await AsyncStorage.getItem('authToken');
  const userId = await AsyncStorage.getItem('user_id');
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  // List of possible endpoints to test
  const endpointsToTest = [
    // Trip endpoints
    { method: 'GET', url: '/trip/driver/rides', description: 'Driver rides' },
    { method: 'GET', url: '/trip/driver/history', description: 'Driver trip history' },
    { method: 'GET', url: `/driver/${userId}/trips`, description: 'Driver trips by ID' },
    { method: 'GET', url: '/trip/driver/completed', description: 'Completed trips' },
    { method: 'GET', url: '/trip/available', description: 'Available trips' },
    
    // Prebooked endpoints
    { method: 'GET', url: '/trip/driver/prebooked', description: 'Pre-booked rides' },
    { method: 'GET', url: '/trip/scheduled', description: 'Scheduled trips' },
    { method: 'GET', url: '/trip/driver/scheduled', description: 'Driver scheduled trips' },
    
    // Driver endpoints
    { method: 'GET', url: `/driver/info/${userId}`, description: 'Driver info' },
    { method: 'PUT', url: `/driver/update/${userId}`, description: 'Update driver (for upload)' },
    { method: 'PUT', url: `/driver/upload/${userId}`, description: 'Upload driver image' },
    { method: 'PUT', url: `/driver/upload/vehicle/${userId}`, description: 'Upload vehicle image' },
  ];

  console.log('🔍 Testing API endpoints...\n');
  const results = [];

  for (const endpoint of endpointsToTest) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${config.baseUrl}${endpoint.url}`,
        headers,
        timeout: 5000,
        // For POST/PUT requests, add empty body to avoid errors
        ...(endpoint.method !== 'GET' && { data: {} })
      });
      
      const result = {
        ...endpoint,
        status: response.status,
        working: true,
        message: 'OK'
      };
      results.push(result);
      console.log(`✅ ${endpoint.method} ${endpoint.url} - ${response.status} (${endpoint.description})`);
      
    } catch (error) {
      const result = {
        ...endpoint,
        status: error.response?.status || 'ERROR',
        working: false,
        message: error.message
      };
      results.push(result);
      
      if (error.response?.status === 404) {
        console.log(`❌ ${endpoint.method} ${endpoint.url} - 404 Not Found (${endpoint.description})`);
      } else if (error.response?.status === 401) {
        console.log(`🔐 ${endpoint.method} ${endpoint.url} - 401 Unauthorized (${endpoint.description})`);
      } else {
        console.log(`⚠️ ${endpoint.method} ${endpoint.url} - ${error.response?.status || 'ERROR'} (${endpoint.description})`);
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`Working endpoints: ${results.filter(r => r.working).length}`);
  console.log(`Not found (404): ${results.filter(r => r.status === 404).length}`);
  console.log(`Unauthorized (401): ${results.filter(r => r.status === 401).length}`);
  console.log(`Other errors: ${results.filter(r => !r.working && r.status !== 404 && r.status !== 401).length}`);

  return results;
};

/**
 * Test specific trip endpoints with different parameters
 */
export const testTripEndpoints = async () => {
  const authToken = await AsyncStorage.getItem('authToken');
  const userId = await AsyncStorage.getItem('user_id');
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  // Try different trip endpoint variations
  const tripEndpoints = [
    `${config.baseUrl}/trip/driver/rides`,
    `${config.baseUrl}/trip/driver/history`,
    `${config.baseUrl}/trip/driver/${userId}/rides`,
    `${config.baseUrl}/driver/${userId}/trips`,
    `${config.baseUrl}/trip/driver/completed`,
    `${config.baseUrl}/trip/list?driverId=${userId}`,
  ];

  console.log('🚗 Testing trip endpoints specifically...\n');

  for (const url of tripEndpoints) {
    try {
      const response = await axios.get(url, { headers, timeout: 5000 });
      console.log(`✅ ${url} - ${response.status}`);
      console.log(`   Response:`, response.data);
      return { url, success: true, data: response.data };
    } catch (error) {
      console.log(`❌ ${url} - ${error.response?.status || 'ERROR'}: ${error.message}`);
    }
  }

  console.log('❌ No working trip endpoints found');
  return null;
};
