// api_client/user.js
// Client-side JavaScript API functions for user profile management

/**
 * Lấy thông tin người dùng hiện tại
 * 
 * @returns {Promise<Object>} - Thông tin người dùng
 */
async function getProfile() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch('/manager/api/profile.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
 * Cập nhật thông tin hồ sơ người dùng
 * 
 * @param {Object} profileData - Dữ liệu hồ sơ cần cập nhật
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function updateProfile(profileData) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch('/manager/api/update_profile.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(profileData).toString(),
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
 * Đổi mật khẩu người dùng
 * 
 * @param {Object} passwordData - Dữ liệu đổi mật khẩu (oldPassword, newPassword, confirmPassword)
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function changePassword(passwordData) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch('/manager/api/update_profile.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                ...passwordData,
                // Thêm 2 trường giả để không bị lỗi khi API kiểm tra các trường bắt buộc
                firstName: 'placeholder',
                lastName: 'placeholder'
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

// Export các functions để sử dụng
export default {
    getProfile,
    updateProfile,
    changePassword
};
