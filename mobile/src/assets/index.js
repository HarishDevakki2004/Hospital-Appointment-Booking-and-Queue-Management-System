/**
 * Assets exports for React Native
 * Use require() for local images
 * 
 * NOTE: Copy images from frontend/src/assets/ to mobile/src/assets/
 * Required images: profile_pic.png, review1.jpg, review2.jpg, review3.jpg
 */

// Helper function to get image source (handles both URI and require)
export const getImageSource = (imageUri) => {
  if (!imageUri) return null;
  // If it's already a require() object (number), return it
  if (typeof imageUri === 'number') return imageUri;
  // If it's a string (URI), return URI object
  if (typeof imageUri === 'string') return { uri: imageUri };
  // If it's already an object with uri, return it
  if (imageUri && imageUri.uri) return imageUri;
  return null;
};

// Default avatar - copy profile_pic.png from frontend/src/assets/
let defaultAvatar;
try {
  defaultAvatar = require('./profile_pic.png');
} catch (e) {
  // Fallback if image doesn't exist
  defaultAvatar = null;
}

// Review images - copy from frontend/src/assets/
let review1, review2, review3;
try {
  review1 = require('./review1.jpg');
} catch (e) {
  review1 = null;
}

try {
  review2 = require('./review2.jpg');
} catch (e) {
  review2 = null;
}

try {
  review3 = require('./review3.jpg');
} catch (e) {
  review3 = null;
}

export { review1, review2, review3 };

// Export default avatar with fallback
export const getDefaultAvatar = () => {
  if (defaultAvatar) return defaultAvatar;
  // Fallback to placeholder URI if local image doesn't exist
  return { uri: 'https://via.placeholder.com/150' };
};

