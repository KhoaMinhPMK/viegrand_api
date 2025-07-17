// Lấy các phần tử DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Biến để theo dõi trạng thái hiển thị mật khẩu
let isPasswordVisible = false;

// Nạp header và navigation component cho trang đăng nhập
window.addEventListener('DOMContentLoaded', function() {
    // Header
    fetch('../../../component/header.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            console.log('Header đã được tải');
        })
        .catch(error => console.error('Lỗi khi tải header:', error));
    
    // Navigation
    fetch('../../../component/navigation.html')
        .then(res => res.text())
        .then(data => {
            document.getElementById('nav-container').innerHTML = data;
            console.log('Navigation đã được tải');
        })
        .catch(error => console.error('Lỗi khi tải navigation:', error));
});

// Hàm hiển thị/ẩn mật khẩu
function togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
    
    if (isPasswordVisible) {
        passwordInput.type = 'text';
        togglePasswordBtn.querySelector('.eye-icon').textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.querySelector('.eye-icon').textContent = '👁️';
    }
}

// Hàm validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Hàm validate mật khẩu
function validatePassword(password) {
    return password.length >= 6;
}

// Hàm hiển thị lỗi
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

// Hàm ẩn lỗi
function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
}

// Hàm thêm class error cho input
function addErrorClass(input) {
    input.classList.add('error');
}

// Hàm xóa class error cho input
function removeErrorClass(input) {
    input.classList.remove('error');
}

// Hàm validate form
function validateForm() {
    let isValid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate email
    if (!email) {
        showError(emailError, 'Vui lòng nhập địa chỉ email');
        addErrorClass(emailInput);
        isValid = false;
    } else if (!validateEmail(email)) {
        showError(emailError, 'Địa chỉ email không hợp lệ');
        addErrorClass(emailInput);
        isValid = false;
    } else {
        hideError(emailError);
        removeErrorClass(emailInput);
    }

    // Validate password
    if (!password) {
        showError(passwordError, 'Vui lòng nhập mật khẩu');
        addErrorClass(passwordInput);
        isValid = false;
    } else if (!validatePassword(password)) {
        showError(passwordError, 'Mật khẩu phải có ít nhất 6 ký tự');
        addErrorClass(passwordInput);
        isValid = false;
    } else {
        hideError(passwordError);
        removeErrorClass(passwordInput);
    }

    return isValid;
}

// Hàm hiển thị loading
function showLoading() {
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
}

// Hàm ẩn loading
function hideLoading() {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
}

// Hàm mô phỏng đăng nhập (thay thế bằng API thực tế)
async function performLogin(email, password, rememberMe) {
    // Mô phỏng delay network
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mô phỏng kiểm tra đăng nhập
    // Trong thực tế, đây sẽ là API call
    if (email === 'admin@company.com' && password === '123456') {
        return { success: true, message: 'Đăng nhập thành công! Chào mừng bạn đến với hệ thống nội bộ.' };
    } else {
        throw new Error('Địa chỉ email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
    }
}

// Hàm xử lý đăng nhập thành công
function handleLoginSuccess(data) {
    // Lưu thông tin đăng nhập nếu chọn "Ghi nhớ"
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedEmail', emailInput.value.trim());
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
    }

    // Hiển thị thông báo thành công
    showNotification(data.message, 'success');
    
    // Chuyển hướng sau 2 giây
    setTimeout(() => {
        console.log('Đăng nhập thành công, chuyển hướng...');
        window.location.href = '../../dashboard/html/index.html';
    }, 2000);
}

// Hàm xử lý đăng nhập thất bại
function handleLoginError(error) {
    showNotification(error.message, 'error');
}

// Hàm hiển thị thông báo
function showNotification(message, type) {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // Thêm styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 5px;
        padding: 15px 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Thêm CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .notification-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.7;
        }
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Xử lý đóng notification
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Tự động đóng sau 5 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Event listener cho nút toggle password
togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

// Event listener cho form submit
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Lấy dữ liệu form
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;
    
    try {
        // Hiển thị loading
        showLoading();
        
        // Thực hiện đăng nhập
        const result = await performLogin(email, password, rememberMe);
        
        // Xử lý thành công
        handleLoginSuccess(result);
        
    } catch (error) {
        // Xử lý lỗi
        handleLoginError(error);
    } finally {
        // Ẩn loading
        hideLoading();
    }
});

// Event listener cho input email - validate real-time
emailInput.addEventListener('input', function() {
    const email = this.value.trim();
    
    if (email && !validateEmail(email)) {
        showError(emailError, 'Địa chỉ email không hợp lệ');
        addErrorClass(this);
    } else {
        hideError(emailError);
        removeErrorClass(this);
    }
});

// Event listener cho input password - validate real-time
passwordInput.addEventListener('input', function() {
    const password = this.value;
    
    if (password && !validatePassword(password)) {
        showError(passwordError, 'Mật khẩu phải có ít nhất 6 ký tự');
        addErrorClass(this);
    } else {
        hideError(passwordError);
        removeErrorClass(this);
    }
});

// Event listener cho Enter key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Khôi phục email đã lưu (nếu có)
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        if (rememberMe === 'true') {
            rememberMeCheckbox.checked = true;
        }
    }
});

// Thêm hiệu ứng focus cho input
[emailInput, passwordInput].forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Thêm hiệu ứng hover cho button
loginBtn.addEventListener('mouseenter', function() {
    if (!this.disabled) {
        this.style.transform = 'translateY(-2px)';
    }
});

loginBtn.addEventListener('mouseleave', function() {
    if (!this.disabled) {
        this.style.transform = 'translateY(0)';
    }
});

// Thêm hiệu ứng cho info panel
document.addEventListener('DOMContentLoaded', function() {
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.style.animation = 'fadeInUp 0.5s ease-out forwards';
    });
    
    // Thêm CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Console log để debug
console.log('Hệ thống Quản lý Doanh nghiệp - Trang đăng nhập đã tải thành công!');
console.log('Phiên bản: 1.0.0 - Phong cách Doanh nghiệp Chuyên nghiệp');
console.log('Test credentials: admin@company.com / 123456');
