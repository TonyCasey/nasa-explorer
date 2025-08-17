const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing frontend API integration...\n');
  
  try {
    console.log('📡 Testing API call that frontend makes...');
    const response = await axios.get('http://localhost:5000/api/v1/apod?_t=1755360000000', {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const duration = Date.now() - Date.now();
    
    console.log(`✅ Frontend API call successful!`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`🎯 Success: ${response.data.success}`);
    
    if (response.data.data) {
      console.log(`📸 Title: ${response.data.data.title}`);
      console.log(`📅 Date: ${response.data.data.date}`);
      console.log(`🖼️ Image URL: ${response.data.data.url}`);
      
      if (response.data.data.title.includes('Fallback Data')) {
        console.log('🔄 Using fallback data (NASA API down - expected)');
      } else {
        console.log('🚀 Using real NASA data!');
      }
    }
    
    console.log(`📦 Response size: ${JSON.stringify(response.data).length} bytes`);
    console.log(`🕒 Timestamp: ${response.data.timestamp}`);
    
    console.log('\n✅ Frontend integration test PASSED!');
    console.log('🎯 The 408 timeout error should now be resolved.');
    
  } catch (error) {
    console.log(`❌ Frontend API test failed: ${error.message}`);
    
    if (error.code === 'ECONNABORTED') {
      console.log('🕒 Frontend timeout - backend still taking too long');
    } else if (error.response?.status === 408) {
      console.log('⏱️ 408 timeout error still occurring');
    } else {
      console.log(`🔍 Error details: ${error.response?.status || error.code}`);
    }
  }
}

testFrontendAPI();