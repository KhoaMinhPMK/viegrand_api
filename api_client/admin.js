// api_client/admin.js
// API client cho các chức năng quản trị

/**
 * Lấy danh sách tài khoản
 * @param {Object} filters - Bộ lọc (status, department, search, page, pageSize)
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function getAccounts(filters = {}) {
    try {
        const url = new URL('/manager/api/admin/get_accounts.php', window.location.origin);
        
        // Thêm các tham số lọc vào URL
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                url.searchParams.append(key, filters[key]);
            }
        });
        
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server',
            accounts: []
        };
    }
}

/**
 * Lấy thông tin chi tiết tài khoản
 * @param {number} id - ID tài khoản
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function getAccountDetail(id) {
    try {
        const url = `/manager/api/admin/get_account_detail.php?id=${id}`;
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server',
            account: null
        };
    }
}

/**
 * Cập nhật thông tin tài khoản
 * @param {number} id - ID tài khoản
 * @param {Object} data - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function updateAccount(id, data) {
    try {
        const url = '/manager/api/admin/update_account.php';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, ...data })
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server'
        };
    }
}

/**
 * Xóa tài khoản
 * @param {number} id - ID tài khoản
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function deleteAccount(id) {
    try {
        const url = '/manager/api/admin/delete_account.php';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server'
        };
    }
}

/**
 * Cập nhật trạng thái tài khoản
 * @param {number} id - ID tài khoản
 * @param {string} status - Trạng thái mới ('pending', 'active', 'inactive')
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function updateAccountStatus(id, status) {
    try {
        const url = '/manager/api/admin/update_account_status.php';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, status })
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server'
        };
    }
}

/**
 * Cập nhật nhiều tài khoản cùng lúc
 * @param {Array<number>} ids - Danh sách ID tài khoản
 * @param {Object} data - Dữ liệu cập nhật (status, notes, ...)
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function bulkUpdateAccounts(ids, data) {
    try {
        const url = '/manager/api/admin/bulk_update_accounts.php';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids, data })
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server'
        };
    }
}

/**
 * Lấy lịch sử hoạt động của tài khoản
 * @param {number} id - ID tài khoản
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function getAccountHistory(id) {
    try {
        const url = `/manager/api/admin/get_account_history.php?id=${id}`;
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server',
            history: []
        };
    }
}

/**
 * Đặt lại mật khẩu cho tài khoản
 * @param {number} id - ID tài khoản
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function resetPassword(id) {
    try {
        const url = '/manager/api/admin/reset_password.php';
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: 'Lỗi kết nối đến server'
        };
    }
}
