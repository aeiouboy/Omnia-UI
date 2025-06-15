#!/usr/bin/env node

// Test authentication client directly
const { default: fetch } = require('node-fetch');

async function testAuth() {
  console.log('🔐 Testing authentication directly...');
  
  const baseUrl = 'https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1';
  const authEndpoint = '/auth/login';
  
  const requestBodies = [
    // Primary format for POC
    {
      partnerClientId: "testpocorderlist",
      partnerClientSecret: "xitgmLwmp",
    },
    // Standard OAuth2 format
    {
      grant_type: "client_credentials",
      client_id: "testpocorderlist",
      client_secret: "xitgmLwmp",
    },
    // Alternative formats
    {
      client_id: "testpocorderlist",
      client_secret: "xitgmLwmp",
    },
    {
      username: "testpocorderlist",
      password: "xitgmLwmp",
    },
    // Try different field names
    {
      clientId: "testpocorderlist",
      clientSecret: "xitgmLwmp",
    },
    {
      user: "testpocorderlist",
      pass: "xitgmLwmp",
    }
  ];
  
  for (const requestBody of requestBodies) {
    try {
      console.log(`📤 Trying format:`, Object.keys(requestBody));
      
      const response = await fetch(`${baseUrl}${authEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.text();
      console.log(`📥 Status: ${response.status} - ${response.statusText}`);
      console.log(`📥 Response:`, data);
      
      if (response.ok) {
        console.log('✅ Authentication successful!');
        const authData = JSON.parse(data);
        console.log('🎯 Token found:', authData);
        break;
      }
      
      console.log('---');
      
    } catch (error) {
      console.log(`❌ Error:`, error.message);
    }
  }
}

testAuth();