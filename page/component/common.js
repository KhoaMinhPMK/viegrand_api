// Common Components JavaScript

// Hiển thị ngày giờ hiện tại
function updateDateTime() {
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    
    const dateElements = document.querySelectorAll('#currentDate');
    const timeElements = document.querySelectorAll('#currentTime');
    
    dateElements.forEach(element => {
        element.textContent = now.toLocaleDateString('vi-VN', dateOptions);
    });
    
    timeElements.forEach(element => {
        element.textContent = now.toLocaleTimeString('vi-VN', timeOptions);
    });
}

// Document Ready function
document.addEventListener('DOMContentLoaded', function() {
    // Thêm hiệu ứng loading cho các link
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href && this.href !== '#') {
                // Thêm hiệu ứng opacity khi click
                this.style.opacity = '0.7';
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 200);
            }
        });
    });
    
    // Theo dõi khi header được nạp hoàn tất
    const headerLoadCheckInterval = setInterval(function() {
        if (document.querySelector('#currentDate') && document.querySelector('#currentTime')) {
            // Cập nhật ngày giờ
            updateDateTime();
            setInterval(updateDateTime, 1000);
            clearInterval(headerLoadCheckInterval);
            console.log('Đã khởi tạo đồng hồ thành công');
        }
    }, 100);
    
    // Console log để debug
    console.log('Hệ thống Quản lý Doanh nghiệp đã tải thành công!');
    console.log('Phiên bản: 1.0.0 - Phong cách Doanh nghiệp Chuyên nghiệp');
});

// Hàm hiển thị thông báo
function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const colors = {
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type]}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // Thêm styles
    const color = colors[type];
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.color};
        border: 1px solid ${color.border};
        border-radius: 5px;
        padding: 15px 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Thêm CSS animation nếu chưa có
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
    }
    
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

// Hàm validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Hàm validate password
function validatePassword(password) {
    return password.length >= 6;
}

// Hàm validate phone number
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Hàm validate required field
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        return `${fieldName} là bắt buộc`;
    }
    return null;
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

// Hàm loading state
function showLoading(button) {
    button.disabled = true;
    button.classList.add('loading');
    const originalText = button.textContent;
    button.setAttribute('data-original-text', originalText);
    button.innerHTML = '<span class="loading-spinner"></span> Đang xử lý...';
}

function hideLoading(button) {
    button.disabled = false;
    button.classList.remove('loading');
    const originalText = button.getAttribute('data-original-text');
    if (originalText) {
        button.textContent = originalText;
    }
}

// Hàm format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Hàm format date
function formatDate(date) {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(date));
}

// Hàm debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Hàm throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export functions for use in other files
window.CommonUtils = {
    updateDateTime,
    showNotification,
    validateEmail,
    validatePassword,
    validatePhone,
    validateRequired,
    showError,
    hideError,
    addErrorClass,
    removeErrorClass,
    showLoading,
    hideLoading,
    formatCurrency,
    formatDate,
    debounce,
    throttle
}; 