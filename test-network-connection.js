import config from './config.js';

// Test network connectivity to the backend
async function testNetworkConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 NETWORK CONNECTION TEST');
  console.log('='.repeat(60));
  console.log('📍 Base URL:', config.baseUrl);
  console.log('🔌 Socket URL:', config.socketUrl);

  try {
    // Test basic connectivity to server
    console.log('\n1. Testing basic server connectivity...');
    const testResponse = await fetch(`${config.socketUrl}/api/v1/trip/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Server is reachable');
      console.log('📡 Response:', data);
    } else {
      console.log('⚠️ Server responded with status:', testResponse.status);
    }

  } catch (error) {
    console.error('❌ Network connection failed:', error.message);
    
    if (error.message.includes('Network request failed')) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Check if backend server is running on port 5000');
      console.log('2. Verify IP address in config.js matches your computer');
      console.log('3. Check firewall settings');
      console.log('4. Try accessing https://getzdriverbackend.vercel.app/api/v1/trip/test in browser');
    }
  }

  // Test payment endpoint specifically
  try {
    console.log('\n2. Testing payment endpoint (without auth)...');
    const paymentResponse = await fetch(`${config.baseUrl}/payment/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 10,
        currency: 'UAH'
      }),
    });

    console.log('📡 Payment endpoint status:', paymentResponse.status);
    if (paymentResponse.status === 401) {
      console.log('✅ Payment endpoint is reachable (401 = needs auth, which is correct)');
    }

  } catch (error) {
    console.error('❌ Payment endpoint failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 NETWORK TEST COMPLETED');
  console.log('='.repeat(60));
}

testNetworkConnection();
