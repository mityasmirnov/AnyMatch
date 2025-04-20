/**
 * API Integration Test Runner
 * 
 * This file runs the API integration tests to verify that
 * the movie API integration works correctly.
 */

import testApiIntegration from './services/apiTest';

// Run the tests
console.log('Starting API integration tests...');
testApiIntegration()
  .then(success => {
    if (success) {
      console.log('All API integration tests passed!');
    } else {
      console.error('Some API integration tests failed.');
    }
  })
  .catch(error => {
    console.error('Error running API integration tests:', error);
  });
