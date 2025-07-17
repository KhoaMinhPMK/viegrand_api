// JavaScript cho trang quản lý tài khoản
document.addEventListener('DOMContentLoaded', function() {
    // Load components
    loadHeader();
    loadNavigation();
    loadFooter();
    
    // Khởi tạo dữ liệu mẫu
    initializeDemoData();
    
    // Set up event listeners
    setupEventListeners();
});

// Hàm load components
function loadHeader() {
    fetch('../../../component/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => console.error('Lỗi khi tải header:', error));
}

function loadNavigation() {
    fetch('../../../component/navigation.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('nav-container').innerHTML = data;
            // Highlight menu item hiện tại
            setTimeout(() => {
                const adminMenuItems = document.querySelectorAll('.nav-link[href*="admin"]');
                adminMenuItems.forEach(item => {
                    item.classList.add('active');
                });
            }, 100);
        })
        .catch(error => console.error('Lỗi khi tải navigation:', error));
}

function loadFooter() {
    fetch('../../../component/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error('Lỗi khi tải footer:', error));
}

// Thiết lập event listeners
function setupEventListeners() {
    // Search và filter
    document.getElementById('searchButton').addEventListener('click', filterAccounts);
    document.getElementById('searchInput').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterAccounts();
        }
    });
    document.getElementById('statusFilter').addEventListener('change', filterAccounts);
    document.getElementById('departmentFilter').addEventListener('change', filterAccounts);
    document.getElementById('refreshButton').addEventListener('click', refreshData);
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', goToPreviousPage);
    document.getElementById('nextPage').addEventListener('click', goToNextPage);
    document.getElementById('pageSize').addEventListener('change', changePageSize);
    
    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
    
    // Bulk actions
    document.getElementById('approveSelectedBtn').addEventListener('click', approveSelected);
    document.getElementById('deactivateSelectedBtn').addEventListener('click', deactivateSelected);
    document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelected);
    document.getElementById('cancelSelectionBtn').addEventListener('click', cancelSelection);
    
    // Modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Save changes in modal
    document.getElementById('saveAccountBtn').addEventListener('click', saveAccountChanges);
    document.getElementById('deleteAccountBtn').addEventListener('click', confirmDeleteAccount);
    document.getElementById('viewHistoryBtn').addEventListener('click', viewAccountHistory);
    
    // Confirmation modal
    document.getElementById('confirmActionBtn').addEventListener('click', executeConfirmedAction);
    document.getElementById('cancelActionBtn').addEventListener('click', closeConfirmationModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const actionModal = document.getElementById('actionModal');
        const confirmationModal = document.getElementById('confirmationModal');
        
        if (event.target === actionModal) {
            actionModal.style.display = 'none';
        }
        
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
}

// Biến toàn cục
let accounts = []; // Danh sách tài khoản
let filteredAccounts = []; // Danh sách tài khoản sau khi lọc
let currentPage = 1; // Trang hiện tại
let pageSize = 10; // Số mục trên mỗi trang
let pendingActionCallback = null; // Callback cho modal xác nhận
let currentAccountId = null; // ID tài khoản đang được chỉnh sửa

// Khởi tạo dữ liệu mẫu
function initializeDemoData() {
    // Dữ liệu mẫu cho danh sách tài khoản
    const departmentOptions = ['it', 'hr', 'finance', 'marketing', 'sales', 'operations'];
    const statusOptions = ['pending', 'active', 'inactive'];
    const positionOptions = ['Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'];
    
    // Tạo 50 tài khoản mẫu
    for (let i = 1; i <= 50; i++) {
        const firstName = `Nguyễn Văn`;
        const lastName = `A${i}`;
        const employeeId = `NV${i.toString().padStart(4, '0')}`;
        
        const account = {
            id: i,
            employeeId: employeeId,
            firstName: firstName,
            lastName: lastName,
            email: `nhanvien${i}@company.com`,
            department: departmentOptions[Math.floor(Math.random() * departmentOptions.length)],
            position: positionOptions[Math.floor(Math.random() * positionOptions.length)],
            phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
            username: `user${i}`,
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
            startDate: randomDate(new Date(2020, 0, 1), new Date()),
            registrationDate: randomDate(new Date(2023, 0, 1), new Date()),
            notes: ''
        };
        
        accounts.push(account);
    }
    
    // Tạo nhiều tài khoản chờ duyệt
    for (let i = 51; i <= 60; i++) {
        const firstName = `Trần Thị`;
        const lastName = `B${i-50}`;
        const employeeId = `NV${i.toString().padStart(4, '0')}`;
        
        const account = {
            id: i,
            employeeId: employeeId,
            firstName: firstName,
            lastName: lastName,
            email: `tranthi${i-50}@company.com`,
            department: departmentOptions[Math.floor(Math.random() * departmentOptions.length)],
            position: positionOptions[Math.floor(Math.random() * positionOptions.length)],
            phone: `097${Math.floor(1000000 + Math.random() * 9000000)}`,
            username: `user${i}`,
            status: 'pending',
            startDate: randomDate(new Date(2020, 0, 1), new Date()),
            registrationDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
            notes: ''
        };
        
        accounts.push(account);
    }
    
    refreshData();
}

// Hàm tạo ngày ngẫu nhiên
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Lọc danh sách tài khoản
function filterAccounts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;
    
    filteredAccounts = accounts.filter(account => {
        // Lọc theo từ khóa tìm kiếm
        const matchesSearch = 
            account.employeeId.toLowerCase().includes(searchTerm) ||
            account.firstName.toLowerCase().includes(searchTerm) ||
            account.lastName.toLowerCase().includes(searchTerm) ||
            account.email.toLowerCase().includes(searchTerm);
        
        // Lọc theo trạng thái
        const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
        
        // Lọc theo phòng ban
        const matchesDepartment = departmentFilter === 'all' || account.department === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    // Reset về trang đầu tiên sau khi lọc
    currentPage = 1;
    
    // Cập nhật giao diện
    updateUI();
}

// Làm mới dữ liệu
function refreshData() {
    // Reset filters
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('departmentFilter').value = 'all';
    
    // Reset filtered data
    filteredAccounts = [...accounts];
    currentPage = 1;
    
    // Update UI
    updateUI();
}

// Cập nhật giao diện người dùng
function updateUI() {
    updateAccountsTable();
    updatePagination();
    updateSummaryCards();
    updateBulkActionMenu();
}

// Cập nhật bảng tài khoản
function updateAccountsTable() {
    const tableBody = document.getElementById('accountsTableBody');
    tableBody.innerHTML = '';
    
    // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredAccounts.length);
    
    // Hiển thị các tài khoản cho trang hiện tại
    for (let i = startIndex; i < endIndex; i++) {
        const account = filteredAccounts[i];
        const row = document.createElement('tr');
        
        // Định dạng ngày đăng ký
        const registrationDate = new Date(account.registrationDate);
        const formattedDate = `${registrationDate.getDate()}/${registrationDate.getMonth() + 1}/${registrationDate.getFullYear()}`;
        
        // Ánh xạ trạng thái sang tiếng Việt
        const statusText = mapStatusText(account.status);
        
        // Ánh xạ phòng ban sang tiếng Việt
        const departmentText = mapDepartmentText(account.department);
        
        row.innerHTML = `
            <td><input type="checkbox" class="account-checkbox" data-id="${account.id}"></td>
            <td>${account.employeeId}</td>
            <td>${account.lastName} ${account.firstName}</td>
            <td>${account.email}</td>
            <td>${departmentText}</td>
            <td>${formattedDate}</td>
            <td><span class="status-badge ${account.status}">${statusText}</span></td>
            <td>
                <button class="action-btn" title="Xem chi tiết" onclick="viewAccount(${account.id})">
                    <i class="fas fa-edit"></i>
                </button>
                ${account.status === 'pending' ? 
                    `<button class="action-btn" title="Duyệt tài khoản" onclick="approveAccount(${account.id})">
                        <i class="fas fa-check"></i>
                    </button>` : 
                    ''
                }
                ${account.status === 'active' ? 
                    `<button class="action-btn" title="Vô hiệu hóa" onclick="deactivateAccount(${account.id})">
                        <i class="fas fa-ban"></i>
                    </button>` : 
                    ''
                }
                ${account.status === 'inactive' ? 
                    `<button class="action-btn" title="Kích hoạt lại" onclick="reactivateAccount(${account.id})">
                        <i class="fas fa-redo"></i>
                    </button>` : 
                    ''
                }
                <button class="action-btn danger" title="Xóa tài khoản" onclick="deleteAccount(${account.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // Thêm event listeners cho checkboxes
    const checkboxes = document.querySelectorAll('.account-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateBulkActionMenu();
        });
    });
    
    // Cập nhật thông tin hiển thị
    if (filteredAccounts.length > 0) {
        document.getElementById('currentRange').textContent = `${startIndex + 1}-${endIndex}`;
    } else {
        document.getElementById('currentRange').textContent = '0-0';
    }
    document.getElementById('totalItems').textContent = filteredAccounts.length;
}

// Ánh xạ trạng thái sang tiếng Việt
function mapStatusText(status) {
    switch (status) {
        case 'pending': return 'Chờ duyệt';
        case 'active': return 'Đang hoạt động';
        case 'inactive': return 'Đã vô hiệu';
        default: return status;
    }
}

// Ánh xạ phòng ban sang tiếng Việt
function mapDepartmentText(department) {
    switch (department) {
        case 'it': return 'Công nghệ thông tin';
        case 'hr': return 'Nhân sự';
        case 'finance': return 'Tài chính';
        case 'marketing': return 'Marketing';
        case 'sales': return 'Kinh doanh';
        case 'operations': return 'Vận hành';
        default: return department;
    }
}

// Cập nhật pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredAccounts.length / pageSize);
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    // Disable/enable nút Previous
    prevButton.disabled = currentPage === 1;
    
    // Disable/enable nút Next
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    // Cập nhật số trang
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 7) {
        // Hiển thị tất cả các số trang nếu có ít hơn hoặc bằng 7 trang
        for (let i = 1; i <= totalPages; i++) {
            addPageNumber(i);
        }
    } else {
        // Hiển thị trang đầu tiên
        addPageNumber(1);
        
        // Hiển thị dấu chấm lửng nếu trang hiện tại > 3
        if (currentPage > 3) {
            addEllipsis();
        }
        
        // Hiển thị các trang xung quanh trang hiện tại
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = startPage; i <= endPage; i++) {
            addPageNumber(i);
        }
        
        // Hiển thị dấu chấm lửng nếu trang hiện tại < totalPages - 2
        if (currentPage < totalPages - 2) {
            addEllipsis();
        }
        
        // Hiển thị trang cuối cùng
        if (totalPages > 1) {
            addPageNumber(totalPages);
        }
    }
}

// Thêm số trang vào pagination
function addPageNumber(pageNum) {
    const pageNumbers = document.getElementById('pageNumbers');
    const span = document.createElement('span');
    span.classList.add('page-number');
    if (pageNum === currentPage) {
        span.classList.add('active');
    }
    span.textContent = pageNum;
    span.addEventListener('click', () => goToPage(pageNum));
    pageNumbers.appendChild(span);
}

// Thêm dấu chấm lửng vào pagination
function addEllipsis() {
    const pageNumbers = document.getElementById('pageNumbers');
    const span = document.createElement('span');
    span.classList.add('page-number');
    span.textContent = '...';
    span.style.cursor = 'default';
    pageNumbers.appendChild(span);
}

// Đi đến trang cụ thể
function goToPage(page) {
    currentPage = page;
    updateUI();
}

// Đi đến trang trước
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateUI();
    }
}

// Đi đến trang tiếp theo
function goToNextPage() {
    const totalPages = Math.ceil(filteredAccounts.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        updateUI();
    }
}

// Thay đổi kích thước trang
function changePageSize() {
    pageSize = parseInt(document.getElementById('pageSize').value);
    currentPage = 1;
    updateUI();
}

// Cập nhật thẻ tóm tắt
function updateSummaryCards() {
    const pendingCount = accounts.filter(account => account.status === 'pending').length;
    const activeCount = accounts.filter(account => account.status === 'active').length;
    const inactiveCount = accounts.filter(account => account.status === 'inactive').length;
    const totalCount = accounts.length;
    
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('inactiveCount').textContent = inactiveCount;
    document.getElementById('totalCount').textContent = totalCount;
}

// Chọn tất cả tài khoản
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const accountCheckboxes = document.querySelectorAll('.account-checkbox');
    
    accountCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActionMenu();
}

// Lấy danh sách ID tài khoản đã chọn
function getSelectedAccountIds() {
    const checkboxes = document.querySelectorAll('.account-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => parseInt(checkbox.getAttribute('data-id')));
}

// Cập nhật menu hành động hàng loạt
function updateBulkActionMenu() {
    const selectedIds = getSelectedAccountIds();
    const bulkActionMenu = document.getElementById('bulkActionMenu');
    const selectedCount = document.getElementById('selectedCount');
    
    if (selectedIds.length > 0) {
        selectedCount.textContent = selectedIds.length;
        bulkActionMenu.style.display = 'flex';
    } else {
        bulkActionMenu.style.display = 'none';
    }
}

// Hủy chọn tất cả
function cancelSelection() {
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.checked = false;
    
    const accountCheckboxes = document.querySelectorAll('.account-checkbox');
    accountCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    updateBulkActionMenu();
}

// Duyệt các tài khoản đã chọn
function approveSelected() {
    const selectedIds = getSelectedAccountIds();
    if (selectedIds.length === 0) return;
    
    showConfirmationModal(
        'Duyệt tài khoản',
        `Bạn có chắc chắn muốn duyệt ${selectedIds.length} tài khoản đã chọn?`,
        () => {
            selectedIds.forEach(id => {
                const account = accounts.find(acc => acc.id === id);
                if (account && account.status === 'pending') {
                    account.status = 'active';
                }
            });
            
            showNotification(`Đã duyệt ${selectedIds.length} tài khoản thành công`, 'success');
            cancelSelection();
            updateUI();
        }
    );
}

// Vô hiệu hóa các tài khoản đã chọn
function deactivateSelected() {
    const selectedIds = getSelectedAccountIds();
    if (selectedIds.length === 0) return;
    
    showConfirmationModal(
        'Vô hiệu hóa tài khoản',
        `Bạn có chắc chắn muốn vô hiệu hóa ${selectedIds.length} tài khoản đã chọn?`,
        () => {
            selectedIds.forEach(id => {
                const account = accounts.find(acc => acc.id === id);
                if (account && account.status === 'active') {
                    account.status = 'inactive';
                }
            });
            
            showNotification(`Đã vô hiệu hóa ${selectedIds.length} tài khoản thành công`, 'success');
            cancelSelection();
            updateUI();
        }
    );
}

// Xóa các tài khoản đã chọn
function deleteSelected() {
    const selectedIds = getSelectedAccountIds();
    if (selectedIds.length === 0) return;
    
    showConfirmationModal(
        'Xóa tài khoản',
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} tài khoản đã chọn? Hành động này không thể hoàn tác.`,
        () => {
            accounts = accounts.filter(account => !selectedIds.includes(account.id));
            filteredAccounts = filteredAccounts.filter(account => !selectedIds.includes(account.id));
            
            showNotification(`Đã xóa ${selectedIds.length} tài khoản thành công`, 'success');
            cancelSelection();
            updateUI();
        }
    );
}

// Xem chi tiết tài khoản
function viewAccount(accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    currentAccountId = accountId;
    
    // Điền thông tin vào form
    document.getElementById('employeeId').value = account.employeeId;
    document.getElementById('status').value = account.status;
    document.getElementById('firstName').value = account.firstName;
    document.getElementById('lastName').value = account.lastName;
    document.getElementById('email').value = account.email;
    document.getElementById('phone').value = account.phone;
    document.getElementById('department').value = account.department;
    document.getElementById('position').value = account.position;
    document.getElementById('startDate').value = formatDateForInput(account.startDate);
    document.getElementById('username').value = account.username;
    document.getElementById('resetPassword').checked = false;
    document.getElementById('notes').value = account.notes || '';
    
    // Hiển thị modal
    document.getElementById('actionModal').style.display = 'block';
}

// Định dạng ngày cho input date
function formatDateForInput(dateValue) {
    const date = new Date(dateValue);
    return date.toISOString().split('T')[0];
}

// Lưu thay đổi tài khoản
function saveAccountChanges() {
    if (!currentAccountId) return;
    
    const account = accounts.find(acc => acc.id === currentAccountId);
    if (!account) return;
    
    // Lấy giá trị từ form
    const status = document.getElementById('status').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const department = document.getElementById('department').value;
    const position = document.getElementById('position').value.trim();
    const startDate = document.getElementById('startDate').value;
    const resetPassword = document.getElementById('resetPassword').checked;
    const notes = document.getElementById('notes').value.trim();
    
    // Validate
    if (!firstName || !lastName || !email || !phone || !position || !startDate) {
        showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
    }
    
    // Cập nhật thông tin tài khoản
    account.status = status;
    account.firstName = firstName;
    account.lastName = lastName;
    account.email = email;
    account.phone = phone;
    account.department = department;
    account.position = position;
    account.startDate = new Date(startDate);
    account.notes = notes;
    
    // Xử lý đặt lại mật khẩu nếu được chọn
    if (resetPassword) {
        // Trong ứng dụng thực tế, bạn sẽ gửi email đặt lại mật khẩu hoặc tạo mật khẩu tạm thời
        console.log(`Đặt lại mật khẩu cho tài khoản: ${account.username}`);
    }
    
    showNotification('Đã cập nhật thông tin tài khoản thành công', 'success');
    closeModals();
    updateUI();
}

// Xem lịch sử tài khoản
function viewAccountHistory() {
    if (!currentAccountId) return;
    
    // Trong ứng dụng thực tế, bạn sẽ tải lịch sử tài khoản từ cơ sở dữ liệu
    showNotification('Chức năng này sẽ hiển thị lịch sử hoạt động của tài khoản', 'info');
}

// Duyệt tài khoản
function approveAccount(accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || account.status !== 'pending') return;
    
    showConfirmationModal(
        'Duyệt tài khoản',
        `Bạn có chắc chắn muốn duyệt tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})?`,
        () => {
            account.status = 'active';
            showNotification('Tài khoản đã được duyệt thành công', 'success');
            updateUI();
        }
    );
}

// Vô hiệu hóa tài khoản
function deactivateAccount(accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || account.status !== 'active') return;
    
    showConfirmationModal(
        'Vô hiệu hóa tài khoản',
        `Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})?`,
        () => {
            account.status = 'inactive';
            showNotification('Tài khoản đã được vô hiệu hóa', 'success');
            updateUI();
        }
    );
}

// Kích hoạt lại tài khoản
function reactivateAccount(accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || account.status !== 'inactive') return;
    
    showConfirmationModal(
        'Kích hoạt tài khoản',
        `Bạn có chắc chắn muốn kích hoạt lại tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})?`,
        () => {
            account.status = 'active';
            showNotification('Tài khoản đã được kích hoạt lại', 'success');
            updateUI();
        }
    );
}

// Xóa tài khoản
function deleteAccount(accountId) {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    showConfirmationModal(
        'Xóa tài khoản',
        `Bạn có chắc chắn muốn xóa tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})? Hành động này không thể hoàn tác.`,
        () => {
            accounts = accounts.filter(acc => acc.id !== accountId);
            filteredAccounts = filteredAccounts.filter(acc => acc.id !== accountId);
            showNotification('Tài khoản đã được xóa thành công', 'success');
            updateUI();
        }
    );
}

// Xác nhận xóa tài khoản từ modal chi tiết
function confirmDeleteAccount() {
    if (!currentAccountId) return;
    
    const account = accounts.find(acc => acc.id === currentAccountId);
    if (!account) return;
    
    closeModals();
    deleteAccount(currentAccountId);
}

// Hiển thị modal xác nhận
function showConfirmationModal(title, message, callback) {
    document.getElementById('confirmationTitle').textContent = title;
    document.getElementById('confirmationMessage').textContent = message;
    document.getElementById('confirmationModal').style.display = 'block';
    
    pendingActionCallback = callback;
}

// Thực thi hành động đã xác nhận
function executeConfirmedAction() {
    if (pendingActionCallback) {
        pendingActionCallback();
        pendingActionCallback = null;
    }
    
    closeConfirmationModal();
}

// Đóng modal xác nhận
function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

// Đóng tất cả các modal
function closeModals() {
    document.getElementById('actionModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'none';
    currentAccountId = null;
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    // Sử dụng CommonUtils nếu có
    if (typeof CommonUtils !== 'undefined' && CommonUtils.showNotification) {
        CommonUtils.showNotification(message, type);
        return;
    }
    
    // Fallback nếu không có CommonUtils
    alert(message);
}

// Export các hàm để có thể gọi từ HTML
window.viewAccount = viewAccount;
window.approveAccount = approveAccount;
window.deactivateAccount = deactivateAccount;
window.reactivateAccount = reactivateAccount;
window.deleteAccount = deleteAccount;
