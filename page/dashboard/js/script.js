// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load components
    loadComponents();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start real-time updates
    startRealTimeUpdates();
});

// Load header, navigation, and footer components
function loadComponents() {
    // Load header
    fetch('../../component/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

    // Load navigation
    fetch('../../component/navigation.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navigation:', error));

    // Load footer
    fetch('../../component/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

// Initialize dashboard functionality
function initializeDashboard() {
    // Update current time
    updateCurrentTime();
    
    // Initialize sidebar navigation
    initializeSidebar();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts (if needed)
    initializeCharts();
}

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Update time display if exists
    const timeElement = document.querySelector('.current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Initialize sidebar navigation
function initializeSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => {
                nav.parentElement.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // Handle navigation (placeholder for future implementation)
            const navText = this.querySelector('.nav-text').textContent;
            console.log('Navigating to:', navText);
            
            // Show loading state
            showLoadingState();
            
            // Simulate navigation delay
            setTimeout(() => {
                hideLoadingState();
                showNotification(`Đã chuyển đến ${navText}`, 'success');
            }, 1000);
        });
    });
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading data from server
    showLoadingState();
    
    setTimeout(() => {
        // Update stats with real data (simulated)
        updateStats();
        
        // Update recent activities
        updateRecentActivities();
        
        // Update system status
        updateSystemStatus();
        
        hideLoadingState();
    }, 1500);
}

// Update statistics
function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent.replace(/,/g, ''));
        animateNumber(stat, 0, currentValue, 1000);
    });
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const startValue = start;
    const endValue = end;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Update recent activities
function updateRecentActivities() {
    const activityList = document.querySelector('.activity-list');
    
    // Simulate new activity
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    newActivity.innerHTML = `
        <div class="activity-icon"><i class="fas fa-bell"></i></div>
        <div class="activity-content">
            <h4>Thông báo mới</h4>
            <p>Hệ thống đã được cập nhật thành công</p>
            <span class="activity-time">Vừa xong</span>
        </div>
    `;
    
    // Add to top of list
    if (activityList.firstChild) {
        activityList.insertBefore(newActivity, activityList.firstChild);
    } else {
        activityList.appendChild(newActivity);
    }
    
    // Remove old activities if too many
    const activities = activityList.querySelectorAll('.activity-item');
    if (activities.length > 5) {
        activities[activities.length - 1].remove();
    }
}

// Update system status
function updateSystemStatus() {
    const statusItems = document.querySelectorAll('.status-item');
    
    statusItems.forEach((item, index) => {
        // Simulate status changes
        setTimeout(() => {
            const isOnline = Math.random() > 0.1; // 90% chance of being online
            
            if (isOnline) {
                item.classList.remove('offline', 'warning');
                item.classList.add('online');
            } else {
                item.classList.remove('online');
                item.classList.add('warning');
            }
        }, index * 200);
    });
}

// Initialize charts (placeholder for future chart implementation)
function initializeCharts() {
    // This would be implemented with a charting library like Chart.js
    console.log('Charts initialized');
}

// Set up event listeners
function setupEventListeners() {
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const actionText = this.querySelector('.action-text').textContent;
            handleQuickAction(actionText);
        });
    });
    
    // System status items
    const statusItems = document.querySelectorAll('.status-item');
    
    statusItems.forEach(item => {
        item.addEventListener('click', function() {
            const statusText = this.querySelector('.status-text').textContent;
            showSystemDetails(statusText);
        });
    });
}

// Handle quick actions
function handleQuickAction(action) {
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        
        switch(action) {
            case 'Thêm Nhân viên':
                showNotification('Chuyển đến trang thêm nhân viên', 'info');
                break;
            case 'Tạo Báo cáo':
                showNotification('Đang tạo báo cáo...', 'info');
                break;
            case 'Lịch Làm việc':
                showNotification('Mở lịch làm việc', 'info');
                break;
            case 'Xuất Dữ liệu':
                showNotification('Đang xuất dữ liệu...', 'info');
                break;
            case 'Tìm kiếm':
                showNotification('Mở tìm kiếm', 'info');
                break;
            case 'Cài đặt':
                showNotification('Chuyển đến cài đặt', 'info');
                break;
            default:
                showNotification(`Thực hiện: ${action}`, 'info');
        }
    }, 1000);
}

// Show system details
function showSystemDetails(systemName) {
    const details = {
        'Hệ thống chính': 'Trạng thái: Hoạt động bình thường\nCPU: 45%\nRAM: 60%\nUptime: 15 ngày',
        'Cơ sở dữ liệu': 'Trạng thái: Kết nối ổn định\nQueries: 1,234/giây\nStorage: 75%\nBackup: Thành công',
        'Email server': 'Trạng thái: Hoạt động\nEmails: 89/giờ\nQueue: 0\nSpam blocked: 12',
        'Backup system': 'Trạng thái: Sẵn sàng\nLast backup: 2 giờ trước\nNext backup: 22 giờ\nStorage: 40%'
    };
    
    showNotification(`${systemName}\n${details[systemName] || 'Không có thông tin chi tiết'}`, 'info');
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update time every second
    setInterval(updateCurrentTime, 1000);
    
    // Update stats every 5 minutes
    setInterval(() => {
        updateStats();
    }, 300000);
    
    // Update system status every 30 seconds
    setInterval(() => {
        updateSystemStatus();
    }, 30000);
    
    // Add new activity every 2 minutes
    setInterval(() => {
        updateRecentActivities();
    }, 120000);
}

// Show loading state
function showLoadingState() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Đang tải...</p>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // Add CSS for loading overlay
    if (!document.querySelector('#loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            .loading-spinner {
                text-align: center;
                color: white;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #1e3c72;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Hide loading state
function hideLoadingState() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for notifications
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 400px;
                animation: slideIn 0.3s ease;
            }
            .notification-content {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                border-left: 4px solid #1e3c72;
            }
            .notification-success .notification-content {
                border-left-color: #28a745;
            }
            .notification-error .notification-content {
                border-left-color: #dc3545;
            }
            .notification-warning .notification-content {
                border-left-color: #ffc107;
            }
            .notification-message {
                flex: 1;
                white-space: pre-line;
                font-size: 14px;
                color: #333;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
                margin-left: 10px;
            }
            .notification-close:hover {
                color: #333;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
}

// Export functions for potential use in other modules
window.Dashboard = {
    initializeDashboard,
    updateStats,
    showNotification,
    handleQuickAction
}; 