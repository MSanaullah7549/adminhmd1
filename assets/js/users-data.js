// Initialize API client
const apiClient = new ApiClient('http://localhost:3000/api');

// DOM Elements
const userTableBody = document.querySelector('table tbody');
const totalUsersMetric = document.querySelector('.metric-primary .metric-value');
const activeUsersMetric = document.querySelectorAll('.metric-value')[1];
const pendingUsersMetric = document.querySelectorAll('.metric-value')[2];
const paginationInfo = document.querySelector('.text-muted.small');

let currentPage = 1;
const itemsPerPage = 10;
let allUsers = [];

// Fetch and display users
async function loadUsers() {
  try {
    const response = await apiClient.users.getAll(itemsPerPage, (currentPage - 1) * itemsPerPage);
    allUsers = response.data || [];
    
    // Update table
    displayUsers();
    
    // Update metrics
    const totalUsers = response.total || allUsers.length;
    const activeCount = allUsers.filter(u => u.status === 'Active').length;
    const pendingCount = allUsers.filter(u => u.status === 'Pending').length;
    
    if (totalUsersMetric) totalUsersMetric.textContent = totalUsers.toLocaleString();
    if (activeUsersMetric) activeUsersMetric.textContent = activeCount.toLocaleString();
    if (pendingUsersMetric) pendingUsersMetric.textContent = pendingCount.toLocaleString();
    
    // Update pagination info
    if (paginationInfo) {
      const endIndex = Math.min(currentPage * itemsPerPage, totalUsers);
      const startIndex = (currentPage - 1) * itemsPerPage + 1;
      paginationInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${totalUsers} users`;
    }
  } catch (error) {
    console.error('Failed to load users:', error);
    showError('Failed to load users from server');
  }
}

// Display users in table
function displayUsers() {
  if (!userTableBody) return;
  
  userTableBody.innerHTML = '';
  
  if (allUsers.length === 0) {
    userTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No users found</td></tr>';
    return;
  }
  
  allUsers.forEach(user => {
    const statusClass = user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'secondary';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img class="avatar-img avatar-sm" src="../assets/images/avatar/avatar-default.jpg" alt="${user.name}">
          <div>
            <p class="fw-semibold mb-0">${user.name || 'N/A'}</p>
            <p class="text-muted small mb-0">${user.email || 'N/A'}</p>
          </div>
        </div>
      </td>
      <td>${user.role || 'Viewer'}</td>
      <td>${user.department || 'N/A'}</td>
      <td><span class="badge text-bg-${statusClass}">${user.status || 'Active'}</span></td>
      <td>${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
      <td class="text-end"><a class="btn btn-light btn-sm" href="user-details.html?id=${user.id}">View</a></td>
    `;
    userTableBody.appendChild(row);
  });
}

// Show error message
function showError(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger alert-dismissible fade show';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const mainContent = document.querySelector('.dashboard-content');
  if (mainContent) {
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
});
