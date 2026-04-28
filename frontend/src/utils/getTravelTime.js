/**
 * Utility function to calculate travel time using Google Distance Matrix API
 * @param {Object} origin - { lat: number, lng: number } or address string
 * @param {Object} destination - { lat: number, lng: number } or address string
 * @returns {Promise<{distance: number, duration: number, status: string}>}
 */
export const getTravelTime = (origin, destination) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded. Please check your API key.'));
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();

    // Convert coordinates to string format if needed
    const originStr = typeof origin === 'string' 
      ? origin 
      : `${origin.lat},${origin.lng}`;
    
    const destinationStr = typeof destination === 'string'
      ? destination
      : `${destination.lat},${destination.lng}`;

    service.getDistanceMatrix(
      {
        origins: [originStr],
        destinations: [destinationStr],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const element = response.rows[0].elements[0];
          const distance = element.distance.value / 1000; // Convert to km
          const duration = element.duration.value / 60; // Convert to minutes

          resolve({
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            duration: Math.round(duration), // Round to nearest minute
            status: 'OK'
          });
        } else {
          reject(new Error(`Distance Matrix API error: ${status || response.rows[0].elements[0].status}`));
        }
      }
    );
  });
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};


