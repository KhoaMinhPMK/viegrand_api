// api_client/auth.js
// Client-side JavaScript API functions for authentication

/**
 * Đăng ký tài khoản người dùng mới
 * 
 * @param {Object} userData - Dữ liệu người dùng cần đăng ký
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function register(userData) {
    try {
        const response = await fetch('/manager/api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(userData).toString(),
        });
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối tới server',
            error: error.message
        };
    }
}

/**
 * Đăng nhập vào hệ thống
 * 
 * @param {string} email - Email của người dùng
 * @param {string} password - Mật khẩu của người dùng
 * @param {boolean} rememberMe - Tùy chọn ghi nhớ đăng nhập
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function login(email, password, rememberMe = false) {
    try {
        const response = await fetch('/manager/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email,
                password: password,
                remember_me: rememberMe
            }).toString(),
        });
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối tới server',
            error: error.message
        };
    }
}

/**
 * Gửi yêu cầu khôi phục mật khẩu
 * 
 * @param {string} email - Email của người dùng
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function forgotPassword(email) {
    try {
        const response = await fetch('/manager/api/forgot_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ email }).toString(),
        });
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối tới server',
            error: error.message
        };
    }
}

/**
 * Đặt lại mật khẩu với token
 * 
 * @param {Object} resetData - Dữ liệu đặt lại mật khẩu (token, password, confirmPassword)
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function resetPassword(resetData) {
    try {
        const response = await fetch('/manager/api/reset_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(resetData).toString(),
        });
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối tới server',
            error: error.message
        };
    }
}

/**
 * Đăng xuất khỏi hệ thống
 * 
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function logout() {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/manager/api/logout.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Xóa token khỏi localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('remember_me');
        
        return await response.json();
    } catch (error) {
        // Vẫn xóa token và đăng xuất ở phía client
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('remember_me');
        
        return {
            success: true,
            message: 'Đăng xuất thành công (offline mode)',
        };
    }
}

/**
 * Kiểm tra trạng thái đăng nhập
 * @returns {boolean} - True nếu đã đăng nhập, ngược lại là false
 */
function isLoggedIn() {
    const token = localStorage.getItem('auth_token');
    return !!token; // Chuyển token thành boolean
}

/**
 * Lấy thông tin người dùng đã lưu trong localStorage
 * @returns {Object|null} - Thông tin người dùng hoặc null
 */
function getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Export các functions để sử dụng
export default {
    register,
    login,
    forgotPassword,
    resetPassword,
    logout,
    isLoggedIn,
    getCurrentUser
};
