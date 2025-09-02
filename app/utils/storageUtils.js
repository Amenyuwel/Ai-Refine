/**
 * Utility functions for handling storage operations with quota management
 */

import { toast } from "react-toastify";

/**
 * Safely set an item in sessionStorage with quota error handling and fallback strategies
 * @param {string} key - The storage key
 * @param {any} value - The value to store (will be JSON.stringify'd)
 * @param {function} onQuotaExceeded - Optional callback for quota exceeded
 * @param {boolean} enableFallback - Whether to try fallback strategies
 * @returns {boolean} - Whether the operation was successful
 */
/**
 * Safely set an item in sessionStorage with quota error handling and fallback strategies
 * @param {string} key - The storage key
 * @param {any} value - The value to store (will be JSON.stringify'd)
 * @param {function} onQuotaExceeded - Optional callback for quota exceeded
 * @param {boolean} enableFallback - Whether to try fallback strategies
 * @returns {boolean} - Whether the operation was successful
 */
export const safeSessionStorageSetItem = (key, value, onQuotaExceeded, enableFallback = true) => {
  // Wrapper to catch any missed QuotaExceededError
  try {
    return _internalSafeSessionStorageSetItem(key, value, onQuotaExceeded, enableFallback);
  } catch (error) {
    // Final safety net for any escaped QuotaExceededError
    if (error.name === 'QuotaExceededError') {
      console.error('QuotaExceededError escaped internal handling:', error);
      if (onQuotaExceeded) {
        onQuotaExceeded(error);
      } else {
        toast.error("Storage quota exceeded. Please try with fewer or smaller images.");
      }
      return false;
    }
    // Re-throw non-quota errors
    throw error;
  }
};

// Internal implementation
const _internalSafeSessionStorageSetItem = (key, value, onQuotaExceeded, enableFallback = true) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('SessionStorage quota exceeded:', error);
      
      if (enableFallback) {
        // Try to clear some space and retry
        console.log('Attempting to clear storage and retry...');
        clearOldStorageItems(sessionStorage, [key]);
        
        try {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          sessionStorage.setItem(key, stringValue);
          toast.warning("Storage was full, cleared old data and saved successfully.");
          return true;
        } catch (retryError) {
          console.error('Retry after clearing storage also failed:', retryError);
          // Handle retry quota error as well
          if (retryError.name === 'QuotaExceededError') {
            if (onQuotaExceeded) {
              onQuotaExceeded(retryError);
            } else {
              toast.error("Storage quota exceeded. Please try with fewer or smaller images.");
            }
            return false;
          }
          // Re-throw non-quota errors from retry
          throw retryError;
        }
      }
      
      if (onQuotaExceeded) {
        onQuotaExceeded(error);
      } else {
        toast.error("Storage quota exceeded. Please try with fewer or smaller images.");
      }
      
      return false;
    }
    
    // Re-throw non-quota errors
    throw error;
  }
};

/**
 * Safely set an item in localStorage with quota error handling
 * @param {string} key - The storage key
 * @param {any} value - The value to store (will be JSON.stringify'd)
 * @param {function} onQuotaExceeded - Optional callback for quota exceeded
 * @returns {boolean} - Whether the operation was successful
 */
export const safeLocalStorageSetItem = (key, value, onQuotaExceeded) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded:', error);
      
      if (onQuotaExceeded) {
        onQuotaExceeded(error);
      } else {
        toast.error("Storage quota exceeded. Please try with fewer or smaller images.");
      }
      
      return false;
    }
    
    // Re-throw non-quota errors
    throw error;
  }
};

/**
 * Compress a base64 image to reduce its size
 * @param {string} base64Image - The base64 image string
 * @param {number} quality - Compression quality (0-1)
 * @param {number} maxWidth - Maximum width for the compressed image
 * @param {number} maxHeight - Maximum height for the compressed image
 * @returns {Promise<string>} - The compressed base64 image
 */
export const compressBase64Image = (base64Image, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Set canvas size and draw the image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed base64
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = reject;
    img.src = base64Image;
  });
};

/**
 * Get an estimate of storage usage for a given value
 * @param {any} value - The value to estimate storage for
 * @returns {number} - Estimated size in bytes
 */
export const getStorageSize = (value) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  return new Blob([stringValue]).size;
};

/**
 * Clear old items from storage to make room for new ones
 * @param {Storage} storage - The storage object (sessionStorage or localStorage)
 * @param {string[]} keysToPreserve - Keys that should not be cleared
 */
export const clearOldStorageItems = (storage, keysToPreserve = []) => {
  const keys = Object.keys(storage);
  
  for (const key of keys) {
    if (!keysToPreserve.includes(key)) {
      try {
        storage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove storage item:', key, error);
      }
    }
  }
};

/**
 * Estimate available storage space by attempting to store test data
 * @param {Storage} storage - The storage object to test
 * @returns {number} - Estimated available space in bytes
 */
export const estimateAvailableStorage = (storage) => {
  const testKey = '__storage_test__';
  let testSize = 1024; // Start with 1KB
  let availableSpace = 0;
  
  try {
    // Find the maximum chunk size we can store
    while (testSize < 10 * 1024 * 1024) { // Max 10MB test
      const testData = 'x'.repeat(testSize);
      try {
        storage.setItem(testKey, testData);
        storage.removeItem(testKey);
        availableSpace = testSize;
        testSize *= 2; // Double the test size
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          break;
        }
        throw error;
      }
    }
  } catch (error) {
    console.warn('Failed to estimate storage space:', error);
  } finally {
    // Clean up
    try {
      storage.removeItem(testKey);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  
  return availableSpace;
};
