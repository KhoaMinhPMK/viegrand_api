// api_client/api.js
// Main API client module that combines all API functions

import auth from './auth.js';
import user from './user.js';
import employee from './employee.js';
import dashboard from './dashboard.js';

// Combined API object for easier import in other files
const api = {
    auth,
    user,
    employee,
    dashboard,
    
    // Helper functions
    setAuthToken(token) {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    },
    
    getAuthToken() {
        return localStorage.getItem('auth_token');
    },
    
    setUserData(userData) {
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user_data');
        }
    },
    
    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    },
    
    // Initialize the API client
    init() {
        // Check if there's a token in localStorage and validate it
        if (this.getAuthToken()) {
            user.getProfile().then(response => {
                if (!response.success) {
                    // Token invalid or expired, log out the user
                    this.auth.logout();
                    console.log('Session expired, please log in again');
                }
            }).catch(error => {
                console.error('API initialization error:', error);
            });
        }
        
        console.log('API client initialized');
        return this;
    }
};

// Initialize the API client when this file is loaded
export default api.init();
