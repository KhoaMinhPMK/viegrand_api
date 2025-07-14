// api_client/register_employee.js
// Hàm gửi request đăng ký nhân viên tới API PHP
// Sử dụng: gọi hàm registerEmployee(data)

/**
 * Đăng ký nhân viên mới
 * @param {Object} data - { email, password, fullname, phone }
 * @returns {Promise<Object>} - Kết quả trả về từ API
 */
async function registerEmployee(data) {
    try {
        const response = await fetch('/api/register_employee.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data).toString(),
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Lỗi kết nối tới server' };
    }
}

// Ví dụ sử dụng:
// registerEmployee({
//   email: 'test@company.com',
//   password: '123456',
//   fullname: 'Nguyễn Văn A',
//   phone: '0901234567'
// }).then(result => console.log(result)); 