/**
 * Base64 decode for React Native
 * React Native doesn't have atob built-in
 * Using a simple, reliable implementation
 */
export const base64Decode = (str) => {
  try {
    if (!str || typeof str !== 'string') {
      throw new Error('Invalid input for base64 decode');
    }

    // Base64 character set
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    
    let output = '';
    let i = 0;
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    while (i < str.length) {
      const enc1 = chars.indexOf(str.charAt(i++));
      const enc2 = chars.indexOf(str.charAt(i++));
      const enc3 = chars.indexOf(str.charAt(i++));
      const enc4 = chars.indexOf(str.charAt(i++));
      
      if (enc1 === -1 || enc2 === -1) {
        break;
      }
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      output += String.fromCharCode(chr1);
      
      if (enc3 !== -1 && enc3 !== 64) {
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        output += String.fromCharCode(chr2);
      }
      
      if (enc4 !== -1 && enc4 !== 64) {
        const chr3 = ((enc3 & 3) << 6) | enc4;
        output += String.fromCharCode(chr3);
      }
    }
    
    // Simple UTF-8 decode
    try {
      return decodeURIComponent(escape(output));
    } catch (e) {
      // If decodeURIComponent fails, return raw output
      return output;
    }
  } catch (error) {
    console.error('Base64 decode error:', error);
    throw new Error('Failed to decode base64: ' + error.message);
  }
};

/**
 * Decode JWT token to get payload
 */
export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    const payload = base64Decode(parts[1]);
    return JSON.parse(payload);
  } catch (error) {
    console.error('JWT decode error:', error);
    throw error;
  }
};

