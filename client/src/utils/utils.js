//A utility to get the error message
export const extractErrorMessage = (html) => {
  // Define the regex pattern to capture the error message before <br>
  const regex = /Error: (.*?)<br>/;

  // Match the pattern against the HTML input
  const match = html.match(regex);

  // Return the error message if found, otherwise return null
  return match ? match[1] : null;
};
