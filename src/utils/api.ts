/**
 * API utility functions for making requests to the backend
 * This handles authentication and error handling consistently across the application
 */

// Default API URL
const DEFAULT_API_URL = 'http://localhost:5000';

/**
 * Get the API URL from environment variables or use the default
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || DEFAULT_API_URL;
};

/**
 * Make a GET request to the API
 * @param endpoint - API endpoint to call (without the base URL)
 */
export const apiGet = async (endpoint: string) => {
  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // No auth token needed - backend has authentication bypass for hackathon demo
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API GET error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a POST request to the API
 * @param endpoint - API endpoint to call (without the base URL)
 * @param body - Request body to send
 */
export const apiPost = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No auth token needed - backend has authentication bypass for hackathon demo
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API POST error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a DELETE request to the API
 * @param endpoint - API endpoint to call (without the base URL)
 */
export const apiDelete = async (endpoint: string) => {
  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
        // No auth token needed - backend has authentication bypass for hackathon demo
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API DELETE error for ${endpoint}:`, error);
    throw error;
  }
};
