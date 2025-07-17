// api_client/dashboard.js
// Client-side JavaScript API functions for dashboard data

/**
 * Lấy dữ liệu thống kê cho dashboard
 * 
 * @returns {Promise<Object>} - Dữ liệu thống kê
 */
async function getDashboardData() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch('/api/dashboard.php', {
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

export default {
    getDashboardData
};
