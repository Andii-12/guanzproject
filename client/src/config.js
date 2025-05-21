// Get the current hostname
const hostname = window.location.hostname;

// Determine if we're running locally
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// Set the API URL based on the environment
export const API_URL = isLocalhost 
  ? 'http://localhost:5000/api'
  : 'https://guanzproject-production.up.railway.app/api';

// Set the restaurant ID
export const RESTAURANT_ID = '681f3910f54d877b11a8febc'; 