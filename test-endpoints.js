// Run this with: node test-endpoints.js
// Make sure to set your authToken and userId first

const axios = require('axios');

const config = {
  baseUrl: "https://getzdriverbackend.vercel.app/api/v1"
};

// Replace these with actual values from AsyncStorage
const authToken = "YOUR_AUTH_TOKEN_HERE"; 
const userId = "YOUR_USER_ID_HERE";

const headers = {
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
};

const testEndpoints = async () => {
  console.log('🔍 Testing API endpoints...\n');
  
  // Test rides endpoints
  const ridesEndpoints = [
    '/trip/driver/rides',
    '/trip/driver/history', 
    `/driver/${userId}/trips`,
    '/trip/driver/completed',
    '/trips',
    '/trip/list',
  ];
  
  console.log('📋 Testing RIDES endpoints:');
  for (const endpoint of ridesEndpoints) {
    try {
      const response = await axios.get(`${config.baseUrl}${endpoint}`, { headers, timeout: 5000 });
      console.log(`✅ ${endpoint} - ${response.status} - Data:`, JSON.stringify(response.data).substring(0, 200));
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || 'ERROR'}: ${error.message}`);
    }
  }

  console.log('\n📅 Testing PREBOOKED endpoints:');
  const prebookedEndpoints = [
    '/trip/driver/prebooked',
    '/trip/scheduled',
    '/trip/driver/scheduled',
    `/driver/${userId}/trips?status=scheduled`,
  ];
  
  for (const endpoint of prebookedEndpoints) {
    try {
      const response = await axios.get(`${config.baseUrl}${endpoint}`, { headers, timeout: 5000 });
      console.log(`✅ ${endpoint} - ${response.status} - Data:`, JSON.stringify(response.data).substring(0, 200));
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || 'ERROR'}: ${error.message}`);
    }
  }

  console.log('\n🚗 Testing DRIVER endpoints:');
  const driverEndpoints = [
    `/driver/info/${userId}`,
    `/driver/${userId}`,
    `/driver/profile/${userId}`,
  ];
  
  for (const endpoint of driverEndpoints) {
    try {
      const response = await axios.get(`${config.baseUrl}${endpoint}`, { headers, timeout: 5000 });
      console.log(`✅ ${endpoint} - ${response.status} - Data:`, JSON.stringify(response.data).substring(0, 200));
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || 'ERROR'}: ${error.message}`);
    }
  }
};

testEndpoints().catch(console.error);

console.log('\n📝 Instructions:');
console.log('1. Replace YOUR_AUTH_TOKEN_HERE with your actual auth token');
console.log('2. Replace YOUR_USER_ID_HERE with your actual user ID');
console.log('3. Run: node test-endpoints.js');
console.log('4. Look for ✅ endpoints that return data');
