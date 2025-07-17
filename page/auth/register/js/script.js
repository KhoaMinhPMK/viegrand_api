// Register Page JavaScript

// Lấy các phần tử DOM
const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

// Password toggle elements
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Form fields
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const employeeIdInput = document.getElementById('employeeId');
const usernameInput = document.getElementById('username');
const departmentSelect = document.getElementById('department');
const positionInput = document.getElementById('position');
const startDateInput = document.getElementById('startDate');
const agreeTermsCheckbox = document.getElementById('agreeTerms');
const agreeNewsletterCheckbox = document.getElementById('agreeNewsletter');

// Error elements
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const employeeIdError = document.getElementById('employeeIdError');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const departmentError = document.getElementById('departmentError');
const positionError = document.getElementById('positionError');
const startDateError = document.getElementById('startDateError');
const agreeTermsError = document.getElementById('agreeTermsError');

// Biến để theo dõi trạng thái hiển thị mật khẩu
let isPasswordVisible = false;
let isConfirmPasswordVisible = false;

// Hàm hiển thị/ẩn mật khẩu
function togglePasswordVisibility(input, button, isVisible) {
    if (isVisible) {
        input.type = 'text';
        button.querySelector('.eye-icon').textContent = '🙈';
    } else {
        input.type = 'password';
        button.querySelector('.eye-icon').textContent = '👁️';
    }
}

// Hàm validate tên
function validateName(name, fieldName) {
    if (!name || name.trim() === '') {
        return `${fieldName} là bắt buộc`;
    }
    if (name.length < 2) {
        return `${fieldName} phải có ít nhất 2 ký tự`;
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
        return `${fieldName} chỉ được chứa chữ cái`;
    }
    return null;
}

// Hàm validate username
function validateUsername(username) {
    if (!username || username.trim() === '') {
        return 'Tên đăng nhập là bắt buộc';
    }
    if (username.length < 4) {
        return 'Tên đăng nhập phải có ít nhất 4 ký tự';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
    }
    return null;
}

// Hàm validate password strength
function validatePasswordStrength(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;
    
    if (strength < 2) {
        return { valid: false, message: 'Mật khẩu quá yếu' };
    } else if (strength < 3) {
        return { valid: false, message: 'Mật khẩu trung bình' };
    } else {
        return { valid: true, message: 'Mật khẩu mạnh' };
    }
}

// Hàm validate employee ID
function validateEmployeeId(employeeId) {
    if (!employeeId || employeeId.trim() === '') {
        return 'Mã nhân viên là bắt buộc';
    }
    if (!/^[A-Z]{2}\d{4}$/.test(employeeId)) {
        return 'Mã nhân viên phải có định dạng: 2 chữ cái + 4 số (VD: NV0001)';
    }
    return null;
}

// Hàm validate date
function validateDate(date) {
    if (!date) {
        return 'Ngày bắt đầu làm việc là bắt buộc';
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    const minDate = new Date('2020-01-01');
    
    if (selectedDate > today) {
        return 'Ngày bắt đầu không thể trong tương lai';
    }
    if (selectedDate < minDate) {
        return 'Ngày bắt đầu không hợp lệ';
    }
    return null;
}

// Hàm validate form
function validateForm() {
    let isValid = true;
    
    // Validate firstName
    const firstNameErrorMsg = validateName(firstNameInput.value, 'Họ');
    if (firstNameErrorMsg) {
        showError(firstNameError, firstNameErrorMsg);
        addErrorClass(firstNameInput);
        isValid = false;
    } else {
        hideError(firstNameError);
        removeErrorClass(firstNameInput);
    }
    
    // Validate lastName
    const lastNameErrorMsg = validateName(lastNameInput.value, 'Tên');
    if (lastNameErrorMsg) {
        showError(lastNameError, lastNameErrorMsg);
        addErrorClass(lastNameInput);
        isValid = false;
    } else {
        hideError(lastNameError);
        removeErrorClass(lastNameInput);
    }
    
    // Validate email
    if (!CommonUtils.validateEmail(emailInput.value)) {
        showError(emailError, 'Địa chỉ email không hợp lệ');
        addErrorClass(emailInput);
        isValid = false;
    } else {
        hideError(emailError);
        removeErrorClass(emailInput);
    }
    
    // Validate phone
    if (!CommonUtils.validatePhone(phoneInput.value)) {
        showError(phoneError, 'Số điện thoại không hợp lệ');
        addErrorClass(phoneInput);
        isValid = false;
    } else {
        hideError(phoneError);
        removeErrorClass(phoneInput);
    }
    
    // Validate employee ID
    const employeeIdErrorMsg = validateEmployeeId(employeeIdInput.value);
    if (employeeIdErrorMsg) {
        showError(employeeIdError, employeeIdErrorMsg);
        addErrorClass(employeeIdInput);
        isValid = false;
    } else {
        hideError(employeeIdError);
        removeErrorClass(employeeIdInput);
    }
    
    // Validate username
    const usernameErrorMsg = validateUsername(usernameInput.value);
    if (usernameErrorMsg) {
        showError(usernameError, usernameErrorMsg);
        addErrorClass(usernameInput);
        isValid = false;
    } else {
        hideError(usernameError);
        removeErrorClass(usernameInput);
    }
    
    // Validate password
    const passwordValidation = validatePasswordStrength(passwordInput.value);
    if (!passwordValidation.valid) {
        showError(passwordError, passwordValidation.message);
        addErrorClass(passwordInput);
        isValid = false;
    } else {
        hideError(passwordError);
        removeErrorClass(passwordInput);
    }
    
    // Validate confirm password
    if (passwordInput.value !== confirmPasswordInput.value) {
        showError(confirmPasswordError, 'Mật khẩu xác nhận không khớp');
        addErrorClass(confirmPasswordInput);
        isValid = false;
    } else {
        hideError(confirmPasswordError);
        removeErrorClass(confirmPasswordInput);
    }
    
    // Validate department
    if (!departmentSelect.value) {
        showError(departmentError, 'Vui lòng chọn phòng ban');
        addErrorClass(departmentSelect);
        isValid = false;
    } else {
        hideError(departmentError);
        removeErrorClass(departmentSelect);
    }
    
    // Validate position
    if (!positionInput.value.trim()) {
        showError(positionError, 'Chức vụ là bắt buộc');
        addErrorClass(positionInput);
        isValid = false;
    } else {
        hideError(positionError);
        removeErrorClass(positionInput);
    }
    
    // Validate start date
    const startDateErrorMsg = validateDate(startDateInput.value);
    if (startDateErrorMsg) {
        showError(startDateError, startDateErrorMsg);
        addErrorClass(startDateInput);
        isValid = false;
    } else {
        hideError(startDateError);
        removeErrorClass(startDateInput);
    }
    
    // Validate terms agreement
    if (!agreeTermsCheckbox.checked) {
        showError(agreeTermsError, 'Bạn phải đồng ý với điều khoản sử dụng');
        isValid = false;
    } else {
        hideError(agreeTermsError);
    }
    
    return isValid;
}

// Hàm mô phỏng đăng ký (thay thế bằng API thực tế)
async function performRegistration(formData) {
    try {
        // Thêm confirmPassword vào formData
        formData.confirmPassword = confirmPasswordInput.value;
        formData.agreeTerms = agreeTermsCheckbox.checked ? 1 : 0;
        
        // Gọi API đăng ký nhân viên thực tế
        const result = await registerEmployee(formData);
        
        if (!result.success) {
            throw new Error(result.message || 'Đã xảy ra lỗi khi đăng ký');
        }
        
        return {
            success: true,
            message: result.message || 'Đăng ký thành công! Tài khoản sẽ được kích hoạt trong vòng 24 giờ.'
        };
    } catch (error) {
        throw new Error(error.message || 'Đã xảy ra lỗi khi đăng ký');
    }
}

// Hàm xử lý đăng ký thành công
function handleRegistrationSuccess(data) {
    CommonUtils.showNotification(data.message, 'success');
    
    // Reset form
    registerForm.reset();
    
    // Chuyển hướng sau 3 giây
    setTimeout(() => {
        window.location.href = '../../login/html/index.html';
    }, 3000);
}

// Hàm xử lý đăng ký thất bại
function handleRegistrationError(error) {
    CommonUtils.showNotification(error.message, 'error');
}

// Event listeners
togglePasswordBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    togglePasswordVisibility(passwordInput, togglePasswordBtn, isPasswordVisible);
});

toggleConfirmPasswordBtn.addEventListener('click', () => {
    isConfirmPasswordVisible = !isConfirmPasswordVisible;
    togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordBtn, isConfirmPasswordVisible);
});

// Form submit
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Lấy dữ liệu form
    const formData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        employeeId: employeeIdInput.value.trim(),
        username: usernameInput.value.trim(),
        password: passwordInput.value,
        department: departmentSelect.value,
        position: positionInput.value.trim(),
        startDate: startDateInput.value,
        agreeNewsletter: agreeNewsletterCheckbox.checked
    };
    
    try {
        // Hiển thị loading
        CommonUtils.showLoading(registerBtn);
        
        // Thực hiện đăng ký
        const result = await performRegistration(formData);
        
        // Xử lý thành công
        handleRegistrationSuccess(result);
        
    } catch (error) {
        // Xử lý lỗi
        handleRegistrationError(error);
    } finally {
        // Ẩn loading
        CommonUtils.hideLoading(registerBtn);
    }
});

// Real-time validation
firstNameInput.addEventListener('input', function() {
    const error = validateName(this.value, 'Họ');
    if (error) {
        CommonUtils.showError(firstNameError, error);
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(firstNameError);
        CommonUtils.removeErrorClass(this);
    }
});

lastNameInput.addEventListener('input', function() {
    const error = validateName(this.value, 'Tên');
    if (error) {
        CommonUtils.showError(lastNameError, error);
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(lastNameError);
        CommonUtils.removeErrorClass(this);
    }
});

emailInput.addEventListener('input', function() {
    if (this.value && !CommonUtils.validateEmail(this.value)) {
        CommonUtils.showError(emailError, 'Địa chỉ email không hợp lệ');
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(emailError);
        CommonUtils.removeErrorClass(this);
    }
});

phoneInput.addEventListener('input', function() {
    if (this.value && !CommonUtils.validatePhone(this.value)) {
        CommonUtils.showError(phoneError, 'Số điện thoại không hợp lệ');
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(phoneError);
        CommonUtils.removeErrorClass(this);
    }
});

employeeIdInput.addEventListener('input', function() {
    const error = validateEmployeeId(this.value);
    if (error) {
        CommonUtils.showError(employeeIdError, error);
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(employeeIdError);
        CommonUtils.removeErrorClass(this);
    }
});

usernameInput.addEventListener('input', function() {
    const error = validateUsername(this.value);
    if (error) {
        CommonUtils.showError(usernameError, error);
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(usernameError);
        CommonUtils.removeErrorClass(this);
    }
});

passwordInput.addEventListener('input', function() {
    const validation = validatePasswordStrength(this.value);
    if (!validation.valid) {
        CommonUtils.showError(passwordError, validation.message);
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(passwordError);
        CommonUtils.removeErrorClass(this);
    }
    
    // Check confirm password match
    if (confirmPasswordInput.value && this.value !== confirmPasswordInput.value) {
        CommonUtils.showError(confirmPasswordError, 'Mật khẩu xác nhận không khớp');
        CommonUtils.addErrorClass(confirmPasswordInput);
    } else if (confirmPasswordInput.value) {
        CommonUtils.hideError(confirmPasswordError);
        CommonUtils.removeErrorClass(confirmPasswordInput);
    }
});

confirmPasswordInput.addEventListener('input', function() {
    if (this.value && this.value !== passwordInput.value) {
        CommonUtils.showError(confirmPasswordError, 'Mật khẩu xác nhận không khớp');
        CommonUtils.addErrorClass(this);
    } else {
        CommonUtils.hideError(confirmPasswordError);
        CommonUtils.removeErrorClass(this);
    }
});

// Set min date for start date
const today = new Date().toISOString().split('T')[0];
startDateInput.setAttribute('max', today);

// Console log để debug
console.log('Trang đăng ký tài khoản đã tải thành công!');
console.log('Sử dụng CommonUtils từ component/common.js'); 

// Nạp header và navigation component cho trang đăng ký
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