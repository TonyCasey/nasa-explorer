const https = require('https');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode} (${duration}ms)`);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ Response: ${JSON.stringify(json).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   ✅ Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ❌ Error response: ${data.substring(0, 200)}`);
        }
        console.log('');
        resolve();
      });
    }).on('error', (err) => {
      console.log(`   ❌ Network error: ${err.message}`);
      console.log('');
      resolve();
    });
  });
}

(async () => {
  console.log('🚀 Testing NASA Space Explorer Backend API\n');
  
  const baseUrl = 'https://nasa-explorer-2347800d91dd.herokuapp.com';
  
  const endpoints = [
    { url: `${baseUrl}/health`, desc: 'Health Check' },
    { url: `${baseUrl}/api/v1/test`, desc: 'Test Endpoint' },
    { url: `${baseUrl}/api/v1/apod`, desc: 'APOD API' },
    { url: `${baseUrl}/api/v1/mars-rovers/photos`, desc: 'Mars Rovers API' },
    { url: `${baseUrl}/api/v1/neo/feed`, desc: 'NEO Feed API' }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.url, endpoint.desc);
  }
  
  console.log('🏁 Backend API test completed!\n');
  
  // Now test frontend directly
  console.log('🌐 Testing frontend accessibility...');
  testEndpoint('https://frontend-qsyjnxvbq-tonys-projects-e30b27a9.vercel.app', 'Frontend Homepage')
    .then(() => {
      console.log('🏁 All tests completed!');
    });
})();