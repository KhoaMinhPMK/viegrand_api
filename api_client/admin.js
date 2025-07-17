// api_client/admin.js
// API client cho các chức năng quản trị

/**
 * Lấy danh sách tài khoản
 * @param {Object} filters - Bộ lọc (status, department, search, page, pageSize)
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function getAccounts(filters = {}) {
    try {
        const url = new URL('/api/admin/get_accounts.php', window.location.origin);
        
        // Thêm các tham số lọc vào URL
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                url.searchParams.append(key, filters[key]);
            }
        });
        
        console.log('Fetching accounts from:', url.toString());
        
        // Thực hiện kiểm tra kết nối API trước
        console.log('Testing API connection...');
        
        const response = await fetch(url, {
            method: 'GET'
            // Tạm thời bỏ yêu cầu token để dễ test
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            console.error('API error status:', response.status);
            const errorText = await response.text();
            console.error('API error response:', errorText);
            return {
                success: false,
                message: `Lỗi API: ${response.status} - ${errorText}`,
                accounts: []
            };
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        // Kiểm tra kết quả trả về
        if (!data.accounts || !Array.isArray(data.accounts)) {
            console.warn('API did not return accounts array', data);
        } else {
            console.log(`API returned ${data.accounts.length} accounts`);
        }
        
        return data;
    } catch (error) {
        console.error('Error in getAccounts:', error);
        console.error('Error stack:', error.stack);
        return {
            success: false,
            message: 'Lỗi kết nối đến server: ' + error.message,
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
        const url = `/api/admin/get_account_detail.php?id=${id}`;
        
        console.log('Fetching account details from:', url);
        
        const response = await fetch(url, {
            method: 'GET'
            // Tạm thời bỏ yêu cầu token để dễ test
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }
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
        const url = '/api/admin/update_account.php';
        
        console.log('Updating account at:', url, 'Data:', data);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
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
        const url = '/api/admin/delete_account.php';
        
        console.log('Deleting account at:', url, 'ID:', id);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
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
        const url = '/api/admin/update_account_status.php';
        
        console.log('Updating account status at:', url, 'ID:', id, 'Status:', status);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
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
        const url = '/api/admin/bulk_update_accounts.php';
        
        console.log('Bulk updating accounts at:', url, 'IDs:', ids, 'Data:', data);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
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
        const url = `/api/admin/get_account_history.php?id=${id}`;
        
        console.log('Fetching account history from:', url);
        
        const response = await fetch(url, {
            method: 'GET'
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
        const url = '/api/admin/reset_password.php';
        
        console.log('Resetting password at:', url, 'ID:', id);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
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
