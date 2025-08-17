const axios = require('axios');

async function quickTest() {
  console.log('Testing local backend speed...');
  const start = Date.now();
  
  try {
    const response = await axios.get('http://localhost:5000/api/v1/apod', {
      timeout: 30000
    });
    const duration = Date.now() - start;
    
    console.log(`✅ Response received in ${duration}ms`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`🎯 Success: ${response.data.success}`);
    console.log(`📸 Title: ${response.data.data?.title}`);
    
    if (duration < 1000) {
      console.log('🚀 Fast response - fallback working properly!');
    } else {
      console.log('🐌 Slow response - still hitting NASA API timeout');
    }
    
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ Error after ${duration}ms: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log('🕒 Frontend timeout - backend taking too long');
    }
  }
}

quickTest();