const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying backend to Heroku...\n');

try {
  // Change to backend directory
  process.chdir(path.join(__dirname, 'backend'));
  
  // Force build
  console.log('📦 Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n📝 Creating temporary deployment commit...');
  
  // Create a temporary commit with just the build changes
  execSync('git add dist/', { stdio: 'inherit' });
  
  try {
    execSync('git commit -m "Deploy: Update built files for Heroku deployment"', { stdio: 'inherit' });
  } catch (e) {
    console.log('No changes to commit, continuing...');
  }
  
  console.log('\n🚀 Pushing to Heroku...');
  execSync('git push heroku HEAD:master --force', { stdio: 'inherit' });
  
  console.log('\n✅ Backend deployment completed!');
  console.log('🌐 Backend URL: https://nasa-explorer-2347800d91dd.herokuapp.com');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}