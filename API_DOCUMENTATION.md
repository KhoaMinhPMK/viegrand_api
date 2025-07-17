## API Documentation for Viegrand Web

This document provides an overview of the API endpoints available in the Viegrand Web application.

### Base URL

All API endpoints are relative to the base URL of your site. For example:
```
https://viegrand.site/api/
```

### Authentication

Most API endpoints require authentication using JWT (JSON Web Token). 
To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer {your_jwt_token}
```

You can obtain a JWT token by calling the login endpoint.

### API Endpoints

## Authentication API

### Login
- **URL**: `/api/login.php`
- **Method**: `POST`
- **Authentication**: No
- **Parameters**:
  - `email` (required): User's email address
  - `password` (required): User's password
  - `remember_me` (optional): Boolean to extend token validity
- **Response**:
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "id": 1,
      "username": "admin",
      "email": "admin@viegrand.site",
      "role": "admin",
      "token": "jwt_token_here",
      "first_name": "Admin",
      "last_name": "User",
      "employee_id": "AD001",
      "department": "IT",
      "position": "Administrator",
      "remember_me": false
    }
  }
  ```

### Register
- **URL**: `/api/register.php`
- **Method**: `POST`
- **Authentication**: No
- **Parameters**:
  - `username` (required): Username
  - `email` (required): Email address
  - `password` (required): Password
  - `confirm_password` (required): Password confirmation
  - `first_name` (required): First name
  - `last_name` (required): Last name
  - `phone` (required): Phone number
- **Response**:
  ```json
  {
    "success": true,
    "message": "Đăng ký thành công"
  }
  ```

### Forgot Password
- **URL**: `/api/forgot_password.php`
- **Method**: `POST`
- **Authentication**: No
- **Parameters**:
  - `email` (required): User's email address
- **Response**:
  ```json
  {
    "success": true,
    "message": "Email khôi phục mật khẩu đã được gửi"
  }
  ```

### Reset Password
- **URL**: `/api/reset_password.php`
- **Method**: `POST`
- **Authentication**: No
- **Parameters**:
  - `token` (required): Reset token from email
  - `password` (required): New password
  - `confirm_password` (required): Password confirmation
- **Response**:
  ```json
  {
    "success": true,
    "message": "Mật khẩu đã được đặt lại thành công"
  }
  ```

### Logout
- **URL**: `/api/logout.php`
- **Method**: `POST`
- **Authentication**: Yes
- **Parameters**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Đăng xuất thành công"
  }
  ```

## User API

### Get Profile
- **URL**: `/api/profile.php`
- **Method**: `GET`
- **Authentication**: Yes
- **Parameters**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Lấy thông tin người dùng thành công",
    "data": {
      "id": 1,
      "username": "admin",
      "email": "admin@viegrand.site",
      "role": "admin",
      "first_name": "Admin",
      "last_name": "User",
      "employee_id": "AD001",
      "department": "IT",
      "position": "Administrator",
      "phone": "0901234567"
    }
  }
  ```

### Update Profile
- **URL**: `/api/update_profile.php`
- **Method**: `POST`
- **Authentication**: Yes
- **Parameters**:
  - `first_name` (required): First name
  - `last_name` (required): Last name
  - `phone` (required): Phone number
  - `old_password` (optional): Current password (required for password change)
  - `new_password` (optional): New password
  - `confirm_password` (optional): New password confirmation
- **Response**:
  ```json
  {
    "success": true,
    "message": "Cập nhật thông tin thành công"
  }
  ```

## Employee API

### Get All Employees
- **URL**: `/api/employees.php`
- **Method**: `GET`
- **Authentication**: Yes (requires admin or manager role)
- **Parameters**:
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of records per page (default: 10)
  - `department` (optional): Filter by department
  - `position` (optional): Filter by position
  - `search` (optional): Search term for employee name, ID, or email
- **Response**:
  ```json
  {
    "success": true,
    "message": "Lấy danh sách nhân viên thành công",
    "data": {
      "employees": [
        {
          "id": 1,
          "user_id": 1,
          "employee_id": "AD001",
          "first_name": "Admin",
          "last_name": "User",
          "phone": "0901234567",
          "department": "IT",
          "position": "Administrator",
          "email": "admin@viegrand.site",
          "username": "admin",
          "role": "admin",
          "status": "active"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "total_pages": 1
      }
    }
  }
  ```

### Get Employee by ID
- **URL**: `/api/employees.php?id={employee_id}`
- **Method**: `GET`
- **Authentication**: Yes
- **Parameters**:
  - `id` (required): Employee ID
- **Response**:
  ```json
  {
    "success": true,
    "message": "Lấy thông tin nhân viên thành công",
    "data": {
      "id": 1,
      "user_id": 1,
      "employee_id": "AD001",
      "first_name": "Admin",
      "last_name": "User",
      "phone": "0901234567",
      "department": "IT",
      "position": "Administrator",
      "email": "admin@viegrand.site",
      "username": "admin",
      "role": "admin",
      "status": "active"
    }
  }
  ```

### Create Employee
- **URL**: `/api/employees.php`
- **Method**: `POST`
- **Authentication**: Yes (requires admin or manager role)
- **Parameters**:
  - `first_name` (required): First name
  - `last_name` (required): Last name
  - `email` (required): Email address
  - `phone` (required): Phone number
  - `employee_id` (required): Employee ID
  - `username` (required): Username
  - `password` (required): Password
  - `department` (required): Department
  - `position` (required): Position
  - `start_date` (required): Start date (YYYY-MM-DD)
  - `role` (optional): User role (admin, manager, user)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Thêm nhân viên mới thành công",
    "data": {
      "employee_id": 2
    }
  }
  ```

### Update Employee
- **URL**: `/api/employees.php?id={employee_id}`
- **Method**: `PUT`
- **Authentication**: Yes (requires admin or manager role)
- **Parameters**:
  - `first_name` (optional): First name
  - `last_name` (optional): Last name
  - `phone` (optional): Phone number
  - `department` (optional): Department
  - `position` (optional): Position
  - `start_date` (optional): Start date (YYYY-MM-DD)
  - `role` (optional): User role (admin, manager, user) - admin only
- **Response**:
  ```json
  {
    "success": true,
    "message": "Cập nhật thông tin nhân viên thành công"
  }
  ```

### Delete Employee
- **URL**: `/api/employees.php?id={employee_id}`
- **Method**: `DELETE`
- **Authentication**: Yes (requires admin role)
- **Parameters**:
  - `id` (required): Employee ID
- **Response**:
  ```json
  {
    "success": true,
    "message": "Xóa nhân viên thành công"
  }
  ```

## Dashboard API

### Get Dashboard Data
- **URL**: `/api/dashboard.php`
- **Method**: `GET`
- **Authentication**: Yes (requires admin or manager role)
- **Parameters**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Lấy dữ liệu dashboard thành công",
    "data": {
      "employee_stats": {
        "total_employees": 10,
        "new_employees": 2
      },
      "department_stats": [
        {
          "department": "IT",
          "count": 5
        },
        {
          "department": "HR",
          "count": 3
        },
        {
          "department": "Sales",
          "count": 2
        }
      ],
      "recent_activities": [
        {
          "id": 1,
          "user_id": 1,
          "username": "admin",
          "action": "login_success",
          "description": "Đăng nhập thành công",
          "ip_address": "192.168.1.1",
          "user_agent": "Mozilla/5.0...",
          "created_at": "2023-08-15 14:30:00"
        }
      ],
      "user_stats": {
        "total_users": 10,
        "admin_count": 1,
        "manager_count": 2,
        "user_count": 7,
        "new_users": 2
      }
    }
  }
  ```

### Error Responses

All API endpoints will return error responses in the following format:

```json
{
  "success": false,
  "message": "Lỗi chi tiết ở đây",
  "errors": ["Optional array of specific errors"]
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input data)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error

### JavaScript API Client

The application includes JavaScript client libraries to simplify API interactions:

- `api_client/auth.js`: Authentication functions
- `api_client/user.js`: User profile management
- `api_client/employee.js`: Employee management
- `api_client/dashboard.js`: Dashboard data
- `api_client/api.js`: Combined API interface

Example usage:
```javascript
// Import the API client
import api from './api_client/api.js';

// Login
const loginResult = await api.auth.login('user@example.com', 'password');
if (loginResult.success) {
  // Store the token
  api.setAuthToken(loginResult.data.token);
  api.setUserData(loginResult.data);
  
  // Get user profile
  const profile = await api.user.getProfile();
  console.log(profile);
  
  // For admin/manager: get employees
  if (loginResult.data.role === 'admin' || loginResult.data.role === 'manager') {
    const employees = await api.employee.getEmployees();
    console.log(employees);
    
    // Get dashboard data
    const dashboardData = await api.dashboard.getDashboardData();
    console.log(dashboardData);
  }
  
  // Logout
  await api.auth.logout();
}
```
