/**
 * Services index file
 * 
 * This file exports all services used in the application.
 * It uses the real movie API service that switches between OMDB and TMDB
 * based on usage limits.
 */

import movieApi from './movieApi';

export {
  movieApi
};
