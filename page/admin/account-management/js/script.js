// JavaScript cho trang quản lý tài khoản
document.addEventListener('DOMContentLoaded', function() {
    // Load components
    loadHeader();
    loadNavigation();
    loadFooter();
    
    // Tải dữ liệu thực tế từ API
    loadAccountsFromAPI();
    
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

// Tải dữ liệu thật từ API
async function loadAccountsFromAPI() {
    try {
        // Hiển thị indicator loading
        showLoading(true);
        
        // Lấy các tham số lọc hiện tại
        const searchTerm = document.getElementById('searchInput').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const departmentFilter = document.getElementById('departmentFilter').value;
        
        // Tạo object chứa các bộ lọc
        const filters = {
            page: currentPage,
            pageSize: pageSize,
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : null,
            department: departmentFilter !== 'all' ? departmentFilter : null
        };
        
        // Gọi API để lấy dữ liệu
        const result = await getAccounts(filters);
        
        if (result.success) {
            // Cập nhật dữ liệu
            accounts = result.accounts;
            filteredAccounts = [...accounts];
            
            // Cập nhật thông tin phân trang
            currentPage = result.pagination.page;
            pageSize = result.pagination.pageSize;
            
            // Cập nhật số lượng tài khoản
            updateSummaryCardsWithData(result.counts);
            
            // Cập nhật giao diện
            updateUI();
        } else {
            // Hiển thị thông báo lỗi
            alert('Lỗi khi tải dữ liệu: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
        // Ẩn indicator loading
        showLoading(false);
    }
}

// Hiển thị hoặc ẩn loading indicator
function showLoading(show) {
    // Kiểm tra xem đã có loading indicator chưa
    let loadingIndicator = document.querySelector('.loading-indicator');
    
    if (show) {
        // Nếu chưa có, tạo mới
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            `;
            document.body.appendChild(loadingIndicator);
        }
        loadingIndicator.style.display = 'flex';
    } else if (loadingIndicator) {
        // Ẩn nếu đã có
        loadingIndicator.style.display = 'none';
    }
}

// Lọc danh sách tài khoản
async function filterAccounts() {
    // Reset về trang đầu tiên sau khi lọc
    currentPage = 1;
    
    // Tải lại dữ liệu với bộ lọc mới
    await loadAccountsFromAPI();
}

// Làm mới dữ liệu
async function refreshData() {
    // Reset filters
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('departmentFilter').value = 'all';
    
    // Reset về trang đầu tiên
    currentPage = 1;
    
    // Tải lại dữ liệu
    await loadAccountsFromAPI();
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
    // Lấy thông tin phân trang từ API response
    const totalItems = accounts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
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
    
    // Cập nhật thông tin hiển thị "Hiển thị X-Y của Z tài khoản"
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems);
    
    document.getElementById('currentRange').textContent = `${startIndex}-${endIndex}`;
    document.getElementById('totalItems').textContent = totalItems;
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
async function goToPage(page) {
    currentPage = page;
    await loadAccountsFromAPI();
}

// Đi đến trang trước
async function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        await loadAccountsFromAPI();
    }
}

// Đi đến trang tiếp theo
async function goToNextPage() {
    // Lấy tổng số trang từ API response
    const totalItems = accounts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    if (currentPage < totalPages) {
        currentPage++;
        await loadAccountsFromAPI();
    }
}

// Thay đổi kích thước trang
async function changePageSize() {
    pageSize = parseInt(document.getElementById('pageSize').value);
    currentPage = 1;
    await loadAccountsFromAPI();
}

// Cập nhật thẻ tóm tắt với dữ liệu từ API
function updateSummaryCardsWithData(counts) {
    document.getElementById('pendingCount').textContent = counts.pending;
    document.getElementById('activeCount').textContent = counts.active;
    document.getElementById('inactiveCount').textContent = counts.inactive;
    document.getElementById('totalCount').textContent = counts.total;
}

// Cập nhật thẻ tóm tắt (phương thức cũ giữ lại để tương thích)
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
        async () => {
            try {
                showLoading(true);
                
                // Gọi API để cập nhật trạng thái hàng loạt
                const result = await bulkUpdateAccounts(selectedIds, { status: 'active' });
                
                if (result.success) {
                    showNotification(`Đã duyệt ${selectedIds.length} tài khoản thành công`, 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                } else {
                    showNotification(`Lỗi: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi duyệt tài khoản:', error);
                showNotification('Đã xảy ra lỗi khi duyệt tài khoản', 'error');
            } finally {
                cancelSelection();
                showLoading(false);
            }
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
        async () => {
            try {
                showLoading(true);
                
                // Gọi API để cập nhật trạng thái hàng loạt
                const result = await bulkUpdateAccounts(selectedIds, { status: 'inactive' });
                
                if (result.success) {
                    showNotification(`Đã vô hiệu hóa ${selectedIds.length} tài khoản thành công`, 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                } else {
                    showNotification(`Lỗi: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi vô hiệu hóa tài khoản:', error);
                showNotification('Đã xảy ra lỗi khi vô hiệu hóa tài khoản', 'error');
            } finally {
                cancelSelection();
                showLoading(false);
            }
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
        async () => {
            try {
                showLoading(true);
                
                // Xóa từng tài khoản một
                let successCount = 0;
                for (const id of selectedIds) {
                    const result = await deleteAccount(id, false); // false để không hiển thị thông báo riêng
                    if (result.success) {
                        successCount++;
                    }
                }
                
                if (successCount > 0) {
                    showNotification(`Đã xóa ${successCount}/${selectedIds.length} tài khoản thành công`, 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                } else {
                    showNotification('Không có tài khoản nào được xóa thành công', 'error');
                }
            } catch (error) {
                console.error('Lỗi khi xóa tài khoản:', error);
                showNotification('Đã xảy ra lỗi khi xóa tài khoản', 'error');
            } finally {
                cancelSelection();
                showLoading(false);
            }
        }
    );
}

// Xem chi tiết tài khoản
async function viewAccount(accountId) {
    try {
        showLoading(true);
        
        // Lấy thông tin chi tiết tài khoản từ API
        const result = await getAccountDetail(accountId);
        
        if (!result.success || !result.account) {
            showNotification('Không thể tải thông tin tài khoản: ' + (result.message || 'Lỗi không xác định'), 'error');
            return;
        }
        
        const account = result.account;
        currentAccountId = accountId;
        
        // Điền thông tin vào form
        document.getElementById('employeeId').value = account.employeeId;
        document.getElementById('status').value = account.status;
        document.getElementById('firstName').value = account.firstName;
        document.getElementById('lastName').value = account.lastName;
        document.getElementById('email').value = account.email;
        document.getElementById('phone').value = account.phone || '';
        document.getElementById('department').value = account.department;
        document.getElementById('position').value = account.position || '';
        document.getElementById('startDate').value = formatDateForInput(account.startDate);
        document.getElementById('username').value = account.username;
        document.getElementById('resetPassword').checked = false;
        document.getElementById('notes').value = account.notes || '';
        
        // Hiển thị modal
        document.getElementById('actionModal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi tải thông tin tài khoản:', error);
        showNotification('Đã xảy ra lỗi khi tải thông tin tài khoản', 'error');
    } finally {
        showLoading(false);
    }
}

// Định dạng ngày cho input date
function formatDateForInput(dateValue) {
    const date = new Date(dateValue);
    return date.toISOString().split('T')[0];
}

// Lưu thay đổi tài khoản
async function saveAccountChanges() {
    if (!currentAccountId) return;
    
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
    if (!firstName || !lastName || !email || !position || !startDate) {
        showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Chuẩn bị dữ liệu để cập nhật
        const updateData = {
            id: currentAccountId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            department: department,
            position: position,
            startDate: startDate,
            status: status,
            notes: notes,
            resetPassword: resetPassword
        };
        
        // Gọi API để cập nhật
        const result = await updateAccount(currentAccountId, updateData);
        
        if (result.success) {
            showNotification('Đã cập nhật thông tin tài khoản thành công', 'success');
            
            // Hiển thị mật khẩu mới nếu có
            if (resetPassword && result.newPassword) {
                alert(`Mật khẩu mới của tài khoản là: ${result.newPassword}\nVui lòng lưu lại mật khẩu này để cung cấp cho người dùng.`);
            }
            
            // Tải lại dữ liệu
            await loadAccountsFromAPI();
            
            // Đóng modal
            closeModals();
        } else {
            showNotification(`Lỗi: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật tài khoản:', error);
        showNotification('Đã xảy ra lỗi khi cập nhật tài khoản', 'error');
    } finally {
        showLoading(false);
    }
}

// Xem lịch sử tài khoản
async function viewAccountHistory() {
    if (!currentAccountId) return;
    
    try {
        showLoading(true);
        
        // Gọi API để lấy lịch sử
        const result = await getAccountHistory(currentAccountId);
        
        if (result.success && result.history) {
            // Tạo popup hiển thị lịch sử
            let historyHtml = `
                <div class="history-modal">
                    <div class="history-modal-content">
                        <div class="history-modal-header">
                            <h3>Lịch sử hoạt động</h3>
                            <span class="close-history">&times;</span>
                        </div>
                        <div class="history-modal-body">
                            <table class="history-table">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Hoạt động</th>
                                        <th>Người thực hiện</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            if (result.history.length > 0) {
                result.history.forEach(item => {
                    historyHtml += `
                        <tr>
                            <td>${item.created_at}</td>
                            <td>${item.description}</td>
                            <td>${item.admin_name || 'Hệ thống'}</td>
                        </tr>
                    `;
                });
            } else {
                historyHtml += `
                    <tr>
                        <td colspan="3" class="no-data">Chưa có hoạt động nào được ghi nhận</td>
                    </tr>
                `;
            }
            
            historyHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            // Thêm modal vào trang
            const historyModalDiv = document.createElement('div');
            historyModalDiv.id = 'historyModal';
            historyModalDiv.innerHTML = historyHtml;
            document.body.appendChild(historyModalDiv);
            
            // Hiển thị modal
            historyModalDiv.style.display = 'block';
            
            // Thêm event listener để đóng
            document.querySelector('.close-history').addEventListener('click', () => {
                document.body.removeChild(historyModalDiv);
            });
            
            // Đóng khi click ngoài modal
            window.addEventListener('click', function(event) {
                if (event.target === historyModalDiv) {
                    document.body.removeChild(historyModalDiv);
                }
            });
        } else {
            showNotification('Không thể tải lịch sử tài khoản: ' + (result.message || 'Lỗi không xác định'), 'error');
        }
    } catch (error) {
        console.error('Lỗi khi tải lịch sử tài khoản:', error);
        showNotification('Đã xảy ra lỗi khi tải lịch sử tài khoản', 'error');
    } finally {
        showLoading(false);
    }
}

// Duyệt tài khoản
async function approveAccount(accountId) {
    // Tìm tài khoản trong danh sách hiện tại
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    showConfirmationModal(
        'Duyệt tài khoản',
        `Bạn có chắc chắn muốn duyệt tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})?`,
        async () => {
            try {
                showLoading(true);
                
                // Gọi API cập nhật trạng thái
                const result = await updateAccountStatus(accountId, 'active');
                
                if (result.success) {
                    showNotification('Tài khoản đã được duyệt thành công', 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                } else {
                    showNotification(`Lỗi: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi duyệt tài khoản:', error);
                showNotification('Đã xảy ra lỗi khi duyệt tài khoản', 'error');
            } finally {
                showLoading(false);
            }
        }
    );
}

// Vô hiệu hóa tài khoản
async function deactivateAccount(accountId) {
    // Tìm tài khoản trong danh sách hiện tại
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    showConfirmationModal(
        'Vô hiệu hóa tài khoản',
        `Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})?`,
        async () => {
            try {
                showLoading(true);
                
                // Gọi API cập nhật trạng thái
                const result = await updateAccountStatus(accountId, 'inactive');
                
                if (result.success) {
                    showNotification('Tài khoản đã được vô hiệu hóa', 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                } else {
                    showNotification(`Lỗi: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi vô hiệu hóa tài khoản:', error);
                showNotification('Đã xảy ra lỗi khi vô hiệu hóa tài khoản', 'error');
            } finally {
                showLoading(false);
            }
        }
    );
}

// Kích hoạt lại tài khoản
async function reactivateAccount(accountId) {
    // Tìm tài khoản trong danh sách hiện tại
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    showConfirmationModal(
        'Kích hoạt tài khoản',
        `Bạn có chắc chắn muốn kích hoạt lại tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})?`,
        async () => {
            try {
                showLoading(true);
                
                // Gọi API cập nhật trạng thái
                const result = await updateAccountStatus(accountId, 'active');
                
                if (result.success) {
                    showNotification('Tài khoản đã được kích hoạt lại', 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                } else {
                    showNotification(`Lỗi: ${result.message}`, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi kích hoạt tài khoản:', error);
                showNotification('Đã xảy ra lỗi khi kích hoạt tài khoản', 'error');
            } finally {
                showLoading(false);
            }
        }
    );
}

// Xóa tài khoản
async function deleteAccount(accountId, showConfirm = true) {
    // Tìm tài khoản trong danh sách hiện tại
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return { success: false, message: 'Không tìm thấy tài khoản' };
    
    const deleteAction = async () => {
        try {
            showLoading(true);
            
            // Gọi API xóa tài khoản
            const result = await window.deleteAccount(accountId);
            
            if (result.success) {
                if (showConfirm) {
                    showNotification('Tài khoản đã được xóa thành công', 'success');
                    // Tải lại dữ liệu
                    await loadAccountsFromAPI();
                }
                return { success: true };
            } else {
                if (showConfirm) {
                    showNotification(`Lỗi: ${result.message}`, 'error');
                }
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Lỗi khi xóa tài khoản:', error);
            if (showConfirm) {
                showNotification('Đã xảy ra lỗi khi xóa tài khoản', 'error');
            }
            return { success: false, message: 'Đã xảy ra lỗi khi xóa tài khoản' };
        } finally {
            if (showConfirm) {
                showLoading(false);
            }
        }
    };
    
    // Nếu yêu cầu hiển thị xác nhận
    if (showConfirm) {
        showConfirmationModal(
            'Xóa tài khoản',
            `Bạn có chắc chắn muốn xóa tài khoản "${account.lastName} ${account.firstName}" (${account.employeeId})? Hành động này không thể hoàn tác.`,
            deleteAction
        );
        return { success: true }; // Trả về kết quả chờ xác nhận
    } else {
        // Thực hiện xóa ngay mà không cần xác nhận
        return await deleteAction();
    }
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
