//A utility to get the error message
export const extractErrorMessage = (html) => {
  // Define the regex pattern to capture the error message before <br>
  const regex = /Error: (.*?)<br>/;

  // Match the pattern against the HTML input
  const match = html.match(regex);

  // Return the error message if found, otherwise return null
  return match ? match[1] : null;
};

// Debounce utility function for search optimization
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Local Storage utility with error handling
export const LocalStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage:`, error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  },
};

// timestampFormatter.js

export function formatTimestamp(isoTimestamp) {
  // Create a new Date object from the ISO timestamp
  const date = new Date(isoTimestamp);

  // Extract the individual components
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds();

  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12 || 12;

  // Construct the formatted time and date string
  const formattedTime = `${hours}:${minutes} ${ampm}`;
  const formattedDate = `${day} ${month} ${year}`;

  return `${formattedDate} at ${formattedTime}`;
}
