#!/usr/bin/env node

// Quick Bearer Token injection script
// Usage: node inject-token.js "YOUR_BEARER_TOKEN_HERE"

const token = process.argv[2];

if (!token) {
  console.log('❌ Please provide your Bearer Token as an argument');
  console.log('Usage: node inject-token.js "YOUR_BEARER_TOKEN_HERE"');
  process.exit(1);
}

const fetch = require('node-fetch');

async function injectToken() {
  try {
    console.log('🔧 Injecting Bearer Token into authentication system...');
    
    const response = await fetch('http://localhost:3001/api/auth/external', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        manualToken: token,
        expiresIn: 3600 // 1 hour
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Bearer Token injected successfully!');
      console.log('🎯 Dashboard will now use real data from merchant orders API');
      console.log('⏰ Token expires in 1 hour');
      console.log('🚀 Visit http://localhost:3001 to see real data');
    } else {
      console.log('❌ Failed to inject token:', result.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('💡 Make sure the development server is running on port 3001');
  }
}

injectToken();