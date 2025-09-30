// Quick test to see what the 500 error returns
const axios = require('axios');

const config = {
  baseUrl: "https://getzdriverbackend.vercel.app/api/v1"
};

// Test without auth to see base response
const testScheduled = async () => {
  console.log('🧪 Testing /trip/scheduled endpoint without auth...\n');
  
  try {
    const response = await axios.get(`${config.baseUrl}/trip/scheduled`, {
      timeout: 10000
    });
    console.log('✅ Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Error Status:', error.response?.status);
    console.log('📄 Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('🔍 Error Message:', error.message);
  }
};

// Test with mock auth header
const testWithAuth = async () => {
  console.log('\n🧪 Testing /trip/scheduled with mock auth...\n');
  
  try {
    const response = await axios.get(`${config.baseUrl}/trip/scheduled`, {
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ Success:', response.status, response.data);
  } catch (error) {
    console.log('❌ Error Status:', error.response?.status);
    console.log('📄 Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('🔍 Error Message:', error.message);
    
    if (error.response?.status === 500) {
      console.log('\n⚠️ This is a 500 Server Error - the endpoint exists but has server-side issues');
      console.log('🛠️ The app should handle this gracefully by showing empty state');
    }
  }
};

const runTests = async () => {
  await testScheduled();
  await testWithAuth();
  
  console.log('\n📝 Summary:');
  console.log('- If you see 401 "No token" = endpoint exists, needs real auth');
  console.log('- If you see 500 error = endpoint exists but server has issues');
  console.log('- If you see connection error = server might be down');
  console.log('\n🚀 Your app should now handle all these cases gracefully!');
};

runTests().catch(console.error);
