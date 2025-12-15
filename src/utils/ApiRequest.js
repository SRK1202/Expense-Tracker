// Using local JSON-Server as backend
const host = "http://localhost:3001";

// User endpoints - using simple REST API pattern
export const setAvatarAPI = `${host}/users`;
export const registerAPI = `${host}/users`;
export const loginAPI = `${host}/users`;

// Transaction endpoints
export const addTransaction = `${host}/transactions`;
export const getTransactions = `${host}/transactions`;
export const editTransactions = `${host}/transactions`;
export const deleteTransactions = `${host}/transactions`;