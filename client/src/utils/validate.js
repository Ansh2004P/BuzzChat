export const checkValidData = (email, password) => {
  if (email) {
    const isEmailValid =
      /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(email);
    if (!isEmailValid) return "Please enter a valid email address";
  }
  
  if (!password) {
    return "Password is required";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  
  const isPasswordValid =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);

  if (!isPasswordValid) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }

  return null;
};

