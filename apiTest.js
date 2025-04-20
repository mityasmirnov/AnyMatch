/**
 * API Integration Test Module
 * 
 * This file allows testing the API integration without requiring
 * a full Node.js environment with ES modules support.
 */

// CommonJS version of the test for direct execution
const fetch = require('node-fetch');

// OMDB API configuration
const OMDB_API_KEY = 'ca037129';
const OMDB_BASE_URL = 'https://www.omdbapi.com/'; // Changed from http to https

// TMDB API configuration
const TMDB_API_KEY = '9fb0b7dde8a42968698cad396ce2ff0b';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZmIwYjdkZGU4YTQyOTY4Njk4Y2FkMzk2Y2UyZmYwYiIsIm5iZiI6MTc0NTE1MzY2My4wNSwic3ViIjoiNjgwNGVlN2Y0MjFhMzA5NzVjYWE4NDk3Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.WawEd2l65xnavxfysawlkiC-L0QZacf70xAPFeZuNUA';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Test OMDB API
async function testOmdbApi() {
  console.log('\n--- Testing OMDB API ---');
  try {
    const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=Jurassic&type=movie`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Response === 'True') {
      console.log(`OMDB API test successful! Found ${data.Search.length} results for "Jurassic"`);
      console.log(`First result: ${data.Search[0].Title} (${data.Search[0].Year})`);
      return true;
    } else {
      console.error(`OMDB API test failed: ${data.Error}`);
      return false;
    }
  } catch (error) {
    console.error('OMDB API test error:', error.message);
    return false;
  }
}

// Test TMDB API
async function testTmdbApi() {
  console.log('\n--- Testing TMDB API ---');
  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=Jurassic`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      console.log(`TMDB API test successful! Found ${data.results.length} results for "Jurassic"`);
      console.log(`First result: ${data.results[0].title} (${data.results[0].release_date.split('-')[0]})`);
      return true;
    } else {
      console.error(`TMDB API test failed: ${data.status_message}`);
      return false;
    }
  } catch (error) {
    console.error('TMDB API test error:', error.message);
    return false;
  }
}

// Run both tests
async function runTests() {
  console.log('Starting API integration tests...');
  
  const omdbSuccess = await testOmdbApi();
  const tmdbSuccess = await testTmdbApi();
  
  if (omdbSuccess && tmdbSuccess) {
    console.log('\n✅ All API tests passed successfully!');
  } else {
    console.log('\n❌ Some API tests failed.');
  }
}

// Execute tests
runTests();
