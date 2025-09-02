/**
 * Test component for verifying storage quota error handling
 * This component can be used in development to test the quota exceeded scenarios
 */

"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { safeSessionStorageSetItem, estimateAvailableStorage, getStorageSize } from "../app/utils/storageUtils";

const StorageQuotaTestComponent = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Test function to fill up storage and trigger quota error
  const testQuotaExceeded = () => {
    try {
      // Create a large data array to exceed quota
      const largeData = Array(1000000).fill("This is a test string to fill up storage quota.");
      
      toast.info("Attempting to store large data to test quota handling...");
      
      const success = safeSessionStorageSetItem(
        "testQuotaData",
        largeData,
        (error) => {
          toast.success("✅ Quota error handled successfully! Custom error handler called.");
          console.log("Custom quota error handler triggered:", error);
        }
      );
      
      if (success) {
        toast.success("Data stored successfully (quota not exceeded)");
        // Clean up
        sessionStorage.removeItem("testQuotaData");
      }
    } catch (error) {
      toast.error(`Test failed with unexpected error: ${error.message}`);
      console.error("Test error:", error);
    }
  };

  // Test storage estimation
  const testStorageEstimation = () => {
    const availableSpace = estimateAvailableStorage(sessionStorage);
    toast.info(`Estimated available storage: ${Math.round(availableSpace / 1024)}KB`);
    
    // Show current storage usage
    let totalUsage = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        totalUsage += getStorageSize(sessionStorage[key]);
      }
    }
    
    toast.info(`Current storage usage: ${Math.round(totalUsage / 1024)}KB`);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
      >
        {isVisible ? "Hide" : "Show"} Storage Test
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[250px]">
          <h3 className="font-bold text-sm mb-3">Storage Quota Tests</h3>
          
          <div className="space-y-2">
            <button
              onClick={testQuotaExceeded}
              className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
            >
              Test Quota Exceeded
            </button>
            
            <button
              onClick={testStorageEstimation}
              className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
            >
              Check Storage Usage
            </button>
            
            <button
              onClick={() => {
                sessionStorage.clear();
                toast.success("Session storage cleared");
              }}
              className="w-full bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear Storage
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ Development only - tests storage quota handling
          </p>
        </div>
      )}
    </div>
  );
};

export default StorageQuotaTestComponent;
