//A utility to get the error message
export const extractErrorMessage = (html) => {
  // Define the regex pattern to capture the error message before <br>
  const regex = /Error: (.*?)<br>/;

  // Match the pattern against the HTML input
  const match = html.match(regex);

  // Return the error message if found, otherwise return null
  return match ? match[1] : null;
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

export const VITE_SERVER_URI="http://localhost:8000/api/v1"
export const VITE_SOCKET_URI="http://localhost:8000"