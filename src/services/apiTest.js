/**
 * API Integration Test
 * 
 * This file tests the movie API integration with both OMDB and TMDB.
 * It verifies that the API switching mechanism works correctly.
 */

// Import the unified movie API service
import movieApi from './services/movieApi';

// Test the API integration
const testApiIntegration = async () => {
  try {
    console.log('Testing API integration...');
    
    // Test popular movies
    console.log('Testing getPopularMovies...');
    const popularMovies = await movieApi.getPopularMovies(1, 5);
    console.log(`Retrieved ${popularMovies.results.length} popular movies`);
    
    // Test popular TV series
    console.log('Testing getPopularTVSeries...');
    const popularTVSeries = await movieApi.getPopularTVSeries(1, 5);
    console.log(`Retrieved ${popularTVSeries.results.length} popular TV series`);
    
    // Test search
    console.log('Testing searchContent...');
    const searchResults = await movieApi.searchContent('Jurassic Park', 'all', 1);
    console.log(`Found ${searchResults.results.length} results for "Jurassic Park"`);
    
    // Test content details (using first search result)
    if (searchResults.results.length > 0) {
      const firstResult = searchResults.results[0];
      console.log(`Testing getContentDetails for ${firstResult.title}...`);
      const contentDetails = await movieApi.getContentDetails(firstResult.id, firstResult.type);
      console.log(`Retrieved details for ${contentDetails.title}`);
    }
    
    // Test genres
    console.log('Testing getGenres...');
    const genres = await movieApi.getGenres();
    console.log(`Retrieved ${genres.length} genres`);
    
    // Test content by genre (using first genre)
    if (genres.length > 0) {
      const firstGenre = genres[0];
      console.log(`Testing getContentByGenre for ${firstGenre.name}...`);
      const contentByGenre = await movieApi.getContentByGenre(firstGenre.id, 'all');
      console.log(`Found ${contentByGenre.results.length} items in genre ${firstGenre.name}`);
    }
    
    // Test content by rating
    console.log('Testing getContentByMinRating...');
    const contentByRating = await movieApi.getContentByMinRating(8.0, 'all');
    console.log(`Found ${contentByRating.results.length} items with rating >= 8.0`);
    
    // Test recommendations
    console.log('Testing getRecommendations...');
    const recommendations = await movieApi.getRecommendations(5, 'all');
    console.log(`Retrieved ${recommendations.results.length} recommendations`);
    
    console.log('API integration tests completed successfully!');
    return true;
  } catch (error) {
    console.error('API integration test failed:', error);
    return false;
  }
};

// Export the test function
export default testApiIntegration;
