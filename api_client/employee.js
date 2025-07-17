// api_client/employee.js
// Client-side JavaScript API functions for employee management

/**
 * Lấy danh sách nhân viên
 * 
 * @param {Object} filters - Các bộ lọc (tùy chọn)
 * @param {number} page - Số trang (mặc định = 1)
 * @param {number} limit - Số lượng trên mỗi trang (mặc định = 10)
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function getEmployees(filters = {}, page = 1, limit = 10) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const queryParams = new URLSearchParams({
            ...filters,
            page: page,
            limit: limit
        }).toString();
        
        const response = await fetch(`/api/employees.php?${queryParams}`, {
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
 * Lấy thông tin chi tiết của một nhân viên
 * 
 * @param {number} employeeId - ID của nhân viên
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function getEmployeeById(employeeId) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch(`/api/employees.php?id=${employeeId}`, {
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
 * Tạo nhân viên mới
 * 
 * @param {Object} employeeData - Dữ liệu nhân viên
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function createEmployee(employeeData) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch('/api/employees.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(employeeData).toString(),
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
 * Cập nhật thông tin nhân viên
 * 
 * @param {number} employeeId - ID của nhân viên
 * @param {Object} employeeData - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function updateEmployee(employeeId, employeeData) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch(`/api/employees.php?id=${employeeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(employeeData).toString(),
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
 * Xóa nhân viên
 * 
 * @param {number} employeeId - ID của nhân viên cần xóa
 * @returns {Promise<Object>} - Kết quả từ API
 */
async function deleteEmployee(employeeId) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return { success: false, message: 'Bạn chưa đăng nhập' };
        }
        
        const response = await fetch(`/api/employees.php?id=${employeeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
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

// Export các functions để sử dụng
export default {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
