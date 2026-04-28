/**
 * ETA Calculator Utility
 * Calculates estimated travel time using Haversine formula (fallback)
 * or calls server API for Directions API (preferred)
 */

import axios from 'axios';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate ETA using fallback method (Haversine + average speed)
 * @param {number} distanceKm - Distance in kilometers
 * @param {string} mode - Travel mode: 'driving', 'walking', 'two-wheeler'
 * @returns {number} Estimated time in minutes
 */
export const calculateFallbackETA = (distanceKm, mode = 'driving') => {
  const averageSpeeds = {
    driving: 40, // km/h
    walking: 5, // km/h
    'two-wheeler': 35, // km/h
  };

  const speed = averageSpeeds[mode] || averageSpeeds.driving;
  const timeHours = distanceKm / speed;
  return Math.round(timeHours * 60); // Convert to minutes
};

/**
 * Fetch ETA from server (preferred method - uses Directions API)
 * @param {number} fromLat - Patient's latitude
 * @param {number} fromLng - Patient's longitude
 * @param {number} toLat - Doctor's latitude
 * @param {number} toLng - Doctor's longitude
 * @param {string} mode - Travel mode
 * @param {string} apiBase - API base URL
 * @param {string} token - Auth token
 * @returns {Promise<{durationMin: number, distanceKm: number, method: string}>}
 */
export const fetchETAFromServer = async (
  fromLat,
  fromLng,
  toLat,
  toLng,
  mode = 'driving',
  apiBase,
  token
) => {
  try {
    const response = await axios.get(`${apiBase}/api/eta`, {
      params: {
        fromLat,
        fromLng,
        toLat,
        toLng,
        mode,
      },
      headers: { token },
      timeout: 8000,
    });

    if (response.data.success) {
      return {
        durationMin: response.data.durationMin,
        distanceKm: response.data.distanceKm,
        method: response.data.method || 'directions_api',
      };
    }
    throw new Error('Server returned unsuccessful response');
  } catch (error) {
    console.error('Error fetching ETA from server:', error);
    throw error;
  }
};

/**
 * Calculate ETA with fallback logic
 * @param {Object} params - Parameters
 * @returns {Promise<{durationMin: number, distanceKm: number, method: string, available: boolean}>}
 */
export const calculateETA = async ({
  fromLat,
  fromLng,
  toLat,
  toLng,
  mode = 'driving',
  apiBase,
  token,
}) => {
  // Validate coordinates
  if (
    !fromLat ||
    !fromLng ||
    !toLat ||
    !toLng ||
    isNaN(fromLat) ||
    isNaN(fromLng) ||
    isNaN(toLat) ||
    isNaN(toLng)
  ) {
    return {
      available: false,
      durationMin: null,
      distanceKm: null,
      method: null,
    };
  }

  // Try server API first (preferred)
  if (apiBase && token) {
    try {
      const result = await fetchETAFromServer(
        fromLat,
        fromLng,
        toLat,
        toLng,
        mode,
        apiBase,
        token
      );
      return {
        ...result,
        available: true,
      };
    } catch (error) {
      console.log('Server ETA failed, using fallback:', error.message);
      // Fall through to fallback
    }
  }

  // Fallback: Calculate using Haversine
  try {
    const distanceKm = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
    const durationMin = calculateFallbackETA(distanceKm, mode);

    return {
      available: true,
      durationMin,
      distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
      method: 'haversine_fallback',
    };
  } catch (error) {
    console.error('Error calculating fallback ETA:', error);
    return {
      available: false,
      durationMin: null,
      distanceKm: null,
      method: null,
    };
  }
};

