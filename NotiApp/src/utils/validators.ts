export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateRequiredField = (value: string): boolean => {
    return value.trim() !== '';
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Example: Password must be at least 6 characters long
};