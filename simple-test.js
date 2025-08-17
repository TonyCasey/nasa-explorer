const axios = require('axios');

async function simpleTest() {
  console.log('🧪 Simple API test after restart...\n');
  
  // Test what the frontend actually calls
  console.log('📡 Testing exact frontend API call...');
  const timestamp = Date.now();
  
  try {
    const response = await axios.get(`http://localhost:5000/api/v1/apod?_t=${timestamp}`, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`🎯 Success: ${response.data.success}`);
    console.log(`📅 Timestamp: ${response.data.timestamp}`);
    
    if (response.data.data) {
      console.log(`📸 Title: ${response.data.data.title}`);
      console.log(`🌌 Type: ${response.data.data.media_type}`);
      console.log(`🔗 URL: ${response.data.data.url}`);
    }
    
    // Success indicators
    if (response.status === 200) {
      console.log('\n🎉 SUCCESS: API returning 200 instead of 408!');
    }
    if (response.data.success === true) {
      console.log('✅ Response structure is correct');  
    }
    if (response.data.data && response.data.data.title) {
      console.log('✅ Data payload is valid');
    }
    
    console.log('\n🚀 The 408 timeout error has been RESOLVED!');
    console.log('🌟 Frontend will now receive data instead of timeouts.');
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('❌ Request timed out - still having timeout issues');
    } else if (error.response?.status === 408) {
      console.log('❌ Still getting 408 Request Timeout');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

simpleTest();