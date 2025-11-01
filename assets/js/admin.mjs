// Admin Console - Full Firebase Integration
// FixIt QC Admin Panel with User, Organization, Station, and Equipment Management

import { 
  authService, 
  userService, 
  organizationService, 
  stationService, 
  equipmentService 
} from './firebase-service.mjs';

// Global state
let currentUser = null;
let currentUserData = null;
let allUsers = [];
let allOrganizations = [];
let allStations = [];
let allEquipment = [];
let authCheckComplete = false;

// AUTH WALL FUNCTIONS
function showAuthWall(message = 'Authentication required', showLogin = true) {
  console.log('🚫 Showing auth wall:', message);
  document.getElementById('authWall').style.display = 'flex';
  document.getElementById('adminContent').style.display = 'none';
  document.getElementById('authMessage').textContent = message;
  document.getElementById('authLoading').style.display = showLogin ? 'none' : 'block';
  document.getElementById('authActions').style.display = showLogin ? 'block' : 'none';
}

function hideAuthWall() {
  console.log('✅ Hiding auth wall - showing admin content');
  document.getElementById('authWall').style.display = 'none';
  document.getElementById('adminContent').style.display = 'block';
  
  // Initialize hamburger menu after content is visible
  initializeHamburgerMenu();
}

// Initialize hamburger menu functionality
function initializeHamburgerMenu() {
  console.log('🍔 Initializing hamburger menu...');
  
  const hamburger = document.getElementById('hamburger');
  const cascade = document.getElementById('cascade');
  
  if (!hamburger || !cascade) {
    console.error('❌ Hamburger or cascade element not found');
    return;
  }
  
  hamburger.addEventListener('click', function() {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    
    hamburger.setAttribute('aria-expanded', !isExpanded);
    cascade.classList.toggle('visible');
    
    console.log('🍔 Menu toggled:', !isExpanded ? 'open' : 'closed');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !cascade.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      cascade.classList.remove('visible');
    }
  });
  
  console.log('✅ Hamburger menu initialized');
}

// IMMEDIATE AUTH CHECK - Block access before anything loads
(async function immediateAuthCheck() {
  console.log('🔒 IMMEDIATE AUTH CHECK: Protecting admin page...');
  
  // Show loading state
  showAuthWall('Verifying authentication...', false);
  
  // Wait a moment for Firebase to initialize
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if user is signed in
  const user = authService.getCurrentUser();
  
  if (!user) {
    console.log('❌ No user signed in - showing login prompt');
    showAuthWall('You must be signed in to access the admin console.', true);
    return;
  }
  
  console.log('✅ User detected:', user.email);
  console.log('🔍 Verifying admin permissions...');
  
  // User is signed in, now check if they're an admin
  // The rest will be handled by the DOMContentLoaded listener
})();

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Admin console initializing...');
  console.log('📍 Current URL:', window.location.href);
  
  // Check authentication
  authService.onAuthStateChanged(async (user) => {
    authCheckComplete = true;
    console.log('🔐 Auth state changed. User:', user ? user.email : 'null');
    
    if (user) {
      console.log('✅ User is signed in:', user.email);
      console.log('🆔 User UID:', user.uid);
      currentUser = user;
      
      console.log('📥 Loading user data from Firestore...');
      await loadUserData(user.uid);
      
      console.log('🎨 Initializing admin panel...');
      await initializeAdminPanel();
      
      // Hide auth wall and show admin content
      hideAuthWall();
    } else {
      // Not authenticated
      console.log('❌ No user signed in');
      showAuthWall('You must be signed in to access the admin console.', true);
    }
  });

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Setup tab switching
  setupTabs();
  
  // Setup modal close handlers
  setupModals();
});

// Load current user data from Firestore
async function loadUserData(authId) {
  console.log('🔍 Loading user data for authId:', authId);
  
  const result = await userService.getUserByAuthId(authId);
  
  console.log('📊 getUserByAuthId result:', result);
  
  if (result.success) {
    currentUserData = result.data;
    console.log('✅ User data loaded:', currentUserData);
    console.log('👤 User role:', currentUserData.role);
    
    // Check if user is admin
    if (currentUserData.role !== 'globalAdmin' && currentUserData.role !== 'localAdmin') {
      console.error('❌ Access denied - user role is:', currentUserData.role);
      showAuthWall(`Access Denied. This console is only accessible to administrators. Your role: ${currentUserData.role}`, false);
      await authService.signOut();
      throw new Error('Insufficient permissions');
    }
    
    console.log('✅ User is admin! Role:', currentUserData.role);
    
    // Display user info
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
      userEmailEl.textContent = currentUser.email;
      console.log('✅ Displayed user email:', currentUser.email);
    }
  } else {
    console.error('❌ Failed to load user data:', result.error);
    console.error('Full error:', result);
    showAuthWall('Unable to verify admin permissions. ' + result.error, false);
    await authService.signOut();
    
    // Show login button after 2 seconds
    setTimeout(() => {
      showAuthWall('Unable to verify admin permissions. Please sign in again.', true);
    }, 2000);
    
    throw new Error('Failed to load user data');
  }
}

// Initialize admin panel
async function initializeAdminPanel() {
  const authLoader = document.getElementById('authLoader');
  const adminContent = document.getElementById('adminContent');
  
  try {
    // Load all data
    await loadAllData();
    
    // Render initial views
    renderUsers();
    renderOrganizations();
    renderStations();
    renderEquipment();
    updateStats();
    
    // Hide loader, show content
    authLoader.style.display = 'none';
    adminContent.style.display = 'block';
    
  } catch (error) {
    console.error('Failed to initialize admin panel:', error);
    authLoader.innerHTML = `
      <p style="color: #ec4242;">Failed to load admin panel</p>
      <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
      <button onclick="location.reload()" class="btn primary" style="margin-top: 16px;">Retry</button>
    `;
  }
}

// Load all data from Firebase
async function loadAllData() {
  // Load organizations first
  const orgsResult = await organizationService.getAllOrganizations();
  if (orgsResult.success) {
    allOrganizations = orgsResult.data;
  }
  
  // Load stations
  const stationsResult = await stationService.getAllStations();
  if (stationsResult.success) {
    allStations = stationsResult.data;
  }
  
  // Load equipment
  const equipmentResult = await equipmentService.getAllEquipment();
  if (equipmentResult.success) {
    allEquipment = equipmentResult.data;
  }
  
  // Load users based on role
  if (currentUserData.role === 'globalAdmin') {
    // Global admins see all users
    const usersResult = await userService.getAllUsers();
    if (usersResult.success) {
      allUsers = usersResult.data;
    }
  } else if (currentUserData.role === 'localAdmin' && currentUserData.organizationId) {
    // Local admins see only users in their organization
    const usersResult = await userService.getUsersByOrganization(currentUserData.organizationId);
    if (usersResult.success) {
      allUsers = usersResult.data;
    }
  }
}

// Setup tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const tabName = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabName}-content`);
      if (content) {
        content.classList.add('active');
      }
    });
  });
}

// Setup modals
function setupModals() {
  // Close on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
  
  // Setup form handlers
  const addUserForm = document.getElementById('addUserForm');
  if (addUserForm) addUserForm.addEventListener('submit', handleAddUser);
  
  const editUserForm = document.getElementById('editUserForm');
  if (editUserForm) editUserForm.addEventListener('submit', handleEditUser);
  
  const addOrgForm = document.getElementById('addOrganizationForm');
  if (addOrgForm) addOrgForm.addEventListener('submit', handleAddOrganization);
  
  const editOrgForm = document.getElementById('editOrganizationForm');
  if (editOrgForm) editOrgForm.addEventListener('submit', handleEditOrganization);
  
  const addStationForm = document.getElementById('addStationForm');
  if (addStationForm) addStationForm.addEventListener('submit', handleAddStation);
  
  const editStationForm = document.getElementById('editStationForm');
  if (editStationForm) editStationForm.addEventListener('submit', handleEditStation);
  
  const addEquipmentForm = document.getElementById('addEquipmentForm');
  if (addEquipmentForm) addEquipmentForm.addEventListener('submit', handleAddEquipment);
  
  const editEquipmentForm = document.getElementById('editEquipmentForm');
  if (editEquipmentForm) editEquipmentForm.addEventListener('submit', handleEditEquipment);
}

// Render functions
function renderUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  if (!tbody) return;
  
  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted);">No users found</td></tr>';
    return;
  }
  
  tbody.innerHTML = allUsers.map(user => {
    const org = allOrganizations.find(o => o.id === user.organizationId);
    const station = allStations.find(s => s.id === user.stationId);
    
    return `
      <tr>
        <td>${user.name || 'N/A'}</td>
        <td>${user.email || 'N/A'}</td>
        <td><span class="role-badge ${user.role}">${formatRole(user.role)}</span></td>
        <td>${station ? station.name : 'N/A'}</td>
        <td>
          <span class="status-indicator ${user.active ? 'active' : 'inactive'}"></span>
          ${user.active ? 'Active' : 'Inactive'}
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="window.editUser('${user.id}')">Edit</button>
            ${canDeleteUser(user) ? `<button class="action-btn delete" onclick="window.deleteUser('${user.id}')">Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderOrganizations() {
  const tbody = document.querySelector('#organizationsTable tbody');
  if (!tbody) return;
  
  if (allOrganizations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">No organizations found</td></tr>';
    return;
  }
  
  tbody.innerHTML = allOrganizations.map(org => {
    const stationCount = allStations.filter(s => s.organizationId === org.id).length;
    const userCount = allUsers.filter(u => u.organizationId === org.id).length;
    
    return `
      <tr>
        <td>${org.name || 'N/A'}</td>
        <td>${stationCount}</td>
        <td>${userCount}</td>
        <td>
          <span class="status-indicator ${org.active ? 'active' : 'inactive'}"></span>
          ${org.active ? 'Active' : 'Inactive'}
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="window.editOrganization('${org.id}')">Edit</button>
            ${currentUserData.role === 'globalAdmin' ? `<button class="action-btn delete" onclick="window.deleteOrganization('${org.id}')">Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderStations() {
  const tbody = document.querySelector('#stationsTable tbody');
  if (!tbody) return;
  
  if (allStations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted);">No stations found</td></tr>';
    return;
  }
  
  tbody.innerHTML = allStations.map(station => {
    const org = allOrganizations.find(o => o.id === station.organizationId);
    const equipmentCount = allEquipment.filter(e => e.stationId === station.id).length;
    
    return `
      <tr>
        <td>${station.name || 'N/A'}</td>
        <td>${station.code || 'N/A'}</td>
        <td>${org ? org.name : 'N/A'}</td>
        <td>${equipmentCount}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="window.editStation('${station.id}')">Edit</button>
            ${canDeleteStation(station) ? `<button class="action-btn delete" onclick="window.deleteStation('${station.id}')">Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderEquipment() {
  const tbody = document.querySelector('#equipmentTable tbody');
  if (!tbody) return;
  
  if (allEquipment.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted);">No equipment found</td></tr>';
    return;
  }
  
  tbody.innerHTML = allEquipment.map(item => {
    const station = allStations.find(s => s.id === item.stationId);
    
    return `
      <tr>
        <td>${item.equipmentId || 'N/A'}</td>
        <td>${item.type || 'N/A'}</td>
        <td>${station ? station.name : 'N/A'}</td>
        <td>
          <span class="status-indicator ${item.status || 'operational'}"></span>
          ${formatStatus(item.status)}
        </td>
        <td>${item.lastService ? new Date(item.lastService).toLocaleDateString() : 'N/A'}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" onclick="window.editEquipment('${item.id}')">Edit</button>
            <button class="action-btn delete" onclick="window.deleteEquipment('${item.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update statistics
function updateStats() {
  const totalUsers = document.getElementById('totalUsers');
  const totalOrgs = document.getElementById('totalOrganizations');
  const totalStations = document.getElementById('totalStations');
  const totalEquipment = document.getElementById('totalEquipment');
  
  if (totalUsers) totalUsers.textContent = allUsers.length;
  if (totalOrgs) totalOrgs.textContent = allOrganizations.length;
  if (totalStations) totalStations.textContent = allStations.length;
  if (totalEquipment) totalEquipment.textContent = allEquipment.length;
}

// Modal functions
window.showAddUserModal = function() {
  // Populate organization dropdown
  populateOrganizationDropdown('newUserOrganization');
  document.getElementById('addUserModal').classList.add('active');
};

window.showAddOrganizationModal = function() {
  if (currentUserData.role !== 'globalAdmin') {
    alert('Only global administrators can add organizations.');
    return;
  }
  document.getElementById('addOrganizationModal').classList.add('active');
};

window.showAddStationModal = function() {
  populateOrganizationDropdown('newStationOrganization');
  document.getElementById('addStationModal').classList.add('active');
};

window.showAddEquipmentModal = function() {
  populateStationDropdown('newEquipmentStation');
  document.getElementById('addEquipmentModal').classList.add('active');
};

window.closeModal = function(modalId) {
  document.getElementById(modalId).classList.remove('active');
};

// User CRUD operations
window.editUser = async function(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUserName').value = user.name || '';
  document.getElementById('editUserEmail').value = user.email || '';
  document.getElementById('editUserRole').value = user.role || 'user';
  
  populateOrganizationDropdown('editUserOrganization', user.organizationId);
  await populateStationDropdown('editUserStation', user.stationId, user.organizationId);
  
  document.getElementById('editUserModal').classList.add('active');
};

window.deleteUser = async function(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  showLoading();
  const result = await userService.deleteUser(userId);
  
  if (result.success) {
    allUsers = allUsers.filter(u => u.id !== userId);
    renderUsers();
    updateStats();
    showNotification('User deleted successfully', 'success');
  } else {
    showNotification('Failed to delete user: ' + result.error, 'error');
  }
  hideLoading();
};

async function handleAddUser(e) {
  e.preventDefault();
  
  const email = document.getElementById('newUserEmail').value;
  const password = document.getElementById('newUserPassword').value;
  const name = document.getElementById('newUserName').value;
  const role = document.getElementById('newUserRole').value;
  const organizationId = document.getElementById('newUserOrganization').value;
  const stationId = document.getElementById('newUserStation').value;
  
  if (!email || !password || !name) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  showLoading();
  
  try {
    // Create auth user first
    const authResult = await authService.createAuthUser(email, password);
    
    if (!authResult.success) {
      showNotification('Failed to create user: ' + authResult.error, 'error');
      hideLoading();
      return;
    }
    
    // Create Firestore user document
    const userData = {
      authId: authResult.user.uid,
      email: email,
      name: name,
      role: role,
      organizationId: organizationId || null,
      stationId: stationId || null,
      active: true
    };
    
    const userResult = await userService.createUser(userData);
    
    if (userResult.success) {
      allUsers.push({ id: userResult.id, ...userData });
      renderUsers();
      updateStats();
      window.closeModal('addUserModal');
      e.target.reset();
      showNotification('User created successfully', 'success');
    } else {
      showNotification('Failed to create user profile: ' + userResult.error, 'error');
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
  
  hideLoading();
}

async function handleEditUser(e) {
  e.preventDefault();
  
  const userId = document.getElementById('editUserId').value;
  const name = document.getElementById('editUserName').value;
  const email = document.getElementById('editUserEmail').value;
  const role = document.getElementById('editUserRole').value;
  const organizationId = document.getElementById('editUserOrganization').value;
  const stationId = document.getElementById('editUserStation').value;
  
  showLoading();
  
  const userData = {
    name: name,
    email: email,
    role: role,
    organizationId: organizationId || null,
    stationId: stationId || null
  };
  
  const result = await userService.updateUser(userId, userData);
  
  if (result.success) {
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...allUsers[userIndex], ...userData };
    }
    renderUsers();
    window.closeModal('editUserModal');
    showNotification('User updated successfully', 'success');
  } else {
    showNotification('Failed to update user: ' + result.error, 'error');
  }
  
  hideLoading();
}

// Organization CRUD operations
window.editOrganization = async function(orgId) {
  const org = allOrganizations.find(o => o.id === orgId);
  if (!org) return;
  
  document.getElementById('editOrganizationId').value = org.id;
  document.getElementById('editOrganizationName').value = org.name || '';
  document.getElementById('editOrganizationContact').value = org.contactEmail || '';
  document.getElementById('editOrganizationPhone').value = org.phone || '';
  
  document.getElementById('editOrganizationModal').classList.add('active');
};

window.deleteOrganization = async function(orgId) {
  if (currentUserData.role !== 'globalAdmin') {
    alert('Only global administrators can delete organizations.');
    return;
  }
  
  // Check if organization has stations
  const hasStations = allStations.some(s => s.organizationId === orgId);
  if (hasStations) {
    alert('Cannot delete organization with existing stations. Please delete all stations first.');
    return;
  }
  
  if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
    return;
  }
  
  showLoading();
  const result = await organizationService.deleteOrganization(orgId);
  
  if (result.success) {
    allOrganizations = allOrganizations.filter(o => o.id !== orgId);
    renderOrganizations();
    updateStats();
    showNotification('Organization deleted successfully', 'success');
  } else {
    showNotification('Failed to delete organization: ' + result.error, 'error');
  }
  hideLoading();
};

async function handleAddOrganization(e) {
  e.preventDefault();
  
  if (currentUserData.role !== 'globalAdmin') {
    showNotification('Only global administrators can add organizations', 'error');
    return;
  }
  
  const name = document.getElementById('newOrganizationName').value;
  const contactEmail = document.getElementById('newOrganizationContact').value;
  const phone = document.getElementById('newOrganizationPhone').value;
  
  if (!name) {
    showNotification('Please enter an organization name', 'error');
    return;
  }
  
  console.log('📝 Creating organization:', { name, contactEmail, phone });
  showLoading();
  
  const orgData = {
    name: name,
    contactEmail: contactEmail || null,
    phone: phone || null
  };
  
  console.log('🔥 Calling Firestore createOrganization...');
  const result = await organizationService.createOrganization(orgData);
  
  console.log('📊 Firestore Result:', result);
  
  if (result.success) {
    console.log('✅ SUCCESS! Organization created with ID:', result.id);
    allOrganizations.push({ id: result.id, ...orgData, active: true });
    renderOrganizations();
    updateStats();
    window.closeModal('addOrganizationModal');
    e.target.reset();
    showNotification('Organization created successfully!', 'success');
  } else {
    console.error('❌ FAILED! Error:', result.error);
    showNotification('Failed to create organization: ' + result.error, 'error');
    alert('Error creating organization. Check browser console (F12) for details.');
  }
  
  hideLoading();
}

async function handleEditOrganization(e) {
  e.preventDefault();
  
  const orgId = document.getElementById('editOrganizationId').value;
  const name = document.getElementById('editOrganizationName').value;
  const contactEmail = document.getElementById('editOrganizationContact').value;
  const phone = document.getElementById('editOrganizationPhone').value;
  
  showLoading();
  
  const orgData = {
    name: name,
    contactEmail: contactEmail || null,
    phone: phone || null
  };
  
  const result = await organizationService.updateOrganization(orgId, orgData);
  
  if (result.success) {
    const orgIndex = allOrganizations.findIndex(o => o.id === orgId);
    if (orgIndex !== -1) {
      allOrganizations[orgIndex] = { ...allOrganizations[orgIndex], ...orgData };
    }
    renderOrganizations();
    window.closeModal('editOrganizationModal');
    showNotification('Organization updated successfully', 'success');
  } else {
    showNotification('Failed to update organization: ' + result.error, 'error');
  }
  
  hideLoading();
}

// Station CRUD operations
window.editStation = async function(stationId) {
  const station = allStations.find(s => s.id === stationId);
  if (!station) return;
  
  document.getElementById('editStationId').value = station.id;
  document.getElementById('editStationName').value = station.name || '';
  document.getElementById('editStationCode').value = station.code || '';
  document.getElementById('editStationLocation').value = station.location || '';
  
  populateOrganizationDropdown('editStationOrganization', station.organizationId);
  
  document.getElementById('editStationModal').classList.add('active');
};

window.deleteStation = async function(stationId) {
  // Check if station has equipment
  const hasEquipment = allEquipment.some(e => e.stationId === stationId);
  if (hasEquipment) {
    alert('Cannot delete station with existing equipment. Please delete all equipment first.');
    return;
  }
  
  if (!confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
    return;
  }
  
  showLoading();
  const result = await stationService.deleteStation(stationId);
  
  if (result.success) {
    allStations = allStations.filter(s => s.id !== stationId);
    renderStations();
    updateStats();
    showNotification('Station deleted successfully', 'success');
  } else {
    showNotification('Failed to delete station: ' + result.error, 'error');
  }
  hideLoading();
};

async function handleAddStation(e) {
  e.preventDefault();
  
  const name = document.getElementById('newStationName').value;
  const code = document.getElementById('newStationCode').value;
  const location = document.getElementById('newStationLocation').value;
  const organizationId = document.getElementById('newStationOrganization').value;
  
  if (!name || !organizationId) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  showLoading();
  
  const stationData = {
    name: name,
    code: code || null,
    location: location || null,
    organizationId: organizationId
  };
  
  const result = await stationService.createStation(stationData);
  
  if (result.success) {
    allStations.push({ id: result.id, ...stationData, active: true });
    renderStations();
    updateStats();
    window.closeModal('addStationModal');
    e.target.reset();
    showNotification('Station created successfully', 'success');
  } else {
    showNotification('Failed to create station: ' + result.error, 'error');
  }
  
  hideLoading();
}

async function handleEditStation(e) {
  e.preventDefault();
  
  const stationId = document.getElementById('editStationId').value;
  const name = document.getElementById('editStationName').value;
  const code = document.getElementById('editStationCode').value;
  const location = document.getElementById('editStationLocation').value;
  const organizationId = document.getElementById('editStationOrganization').value;
  
  showLoading();
  
  const stationData = {
    name: name,
    code: code || null,
    location: location || null,
    organizationId: organizationId
  };
  
  const result = await stationService.updateStation(stationId, stationData);
  
  if (result.success) {
    const stationIndex = allStations.findIndex(s => s.id === stationId);
    if (stationIndex !== -1) {
      allStations[stationIndex] = { ...allStations[stationIndex], ...stationData };
    }
    renderStations();
    window.closeModal('editStationModal');
    showNotification('Station updated successfully', 'success');
  } else {
    showNotification('Failed to update station: ' + result.error, 'error');
  }
  
  hideLoading();
}

// Equipment CRUD operations
window.editEquipment = async function(equipmentId) {
  const equipment = allEquipment.find(e => e.id === equipmentId);
  if (!equipment) return;
  
  document.getElementById('editEquipmentDocId').value = equipment.id;
  document.getElementById('editEquipmentId').value = equipment.equipmentId || '';
  document.getElementById('editEquipmentType').value = equipment.type || '';
  document.getElementById('editEquipmentStatus').value = equipment.status || 'operational';
  document.getElementById('editEquipmentLastService').value = equipment.lastService || '';
  document.getElementById('editEquipmentNotes').value = equipment.notes || '';
  
  await populateStationDropdown('editEquipmentStation', equipment.stationId);
  
  document.getElementById('editEquipmentModal').classList.add('active');
};

window.deleteEquipment = async function(equipmentId) {
  if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
    return;
  }
  
  showLoading();
  const result = await equipmentService.deleteEquipment(equipmentId);
  
  if (result.success) {
    allEquipment = allEquipment.filter(e => e.id !== equipmentId);
    renderEquipment();
    updateStats();
    showNotification('Equipment deleted successfully', 'success');
  } else {
    showNotification('Failed to delete equipment: ' + result.error, 'error');
  }
  hideLoading();
};

async function handleAddEquipment(e) {
  e.preventDefault();
  
  const equipmentId = document.getElementById('newEquipmentId').value;
  const type = document.getElementById('newEquipmentType').value;
  const stationId = document.getElementById('newEquipmentStation').value;
  const status = document.getElementById('newEquipmentStatus').value;
  const lastService = document.getElementById('newEquipmentLastService').value;
  const notes = document.getElementById('newEquipmentNotes').value;
  
  if (!equipmentId || !type || !stationId) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  showLoading();
  
  // Get station to find organizationId
  const station = allStations.find(s => s.id === stationId);
  
  const equipmentData = {
    equipmentId: equipmentId,
    type: type,
    stationId: stationId,
    organizationId: station ? station.organizationId : null,
    status: status || 'operational',
    lastService: lastService || null,
    notes: notes || null
  };
  
  const result = await equipmentService.createEquipment(equipmentData);
  
  if (result.success) {
    allEquipment.push({ id: result.id, ...equipmentData });
    renderEquipment();
    updateStats();
    window.closeModal('addEquipmentModal');
    e.target.reset();
    showNotification('Equipment created successfully', 'success');
  } else {
    showNotification('Failed to create equipment: ' + result.error, 'error');
  }
  
  hideLoading();
}

async function handleEditEquipment(e) {
  e.preventDefault();
  
  const docId = document.getElementById('editEquipmentDocId').value;
  const equipmentId = document.getElementById('editEquipmentId').value;
  const type = document.getElementById('editEquipmentType').value;
  const stationId = document.getElementById('editEquipmentStation').value;
  const status = document.getElementById('editEquipmentStatus').value;
  const lastService = document.getElementById('editEquipmentLastService').value;
  const notes = document.getElementById('editEquipmentNotes').value;
  
  showLoading();
  
  // Get station to find organizationId
  const station = allStations.find(s => s.id === stationId);
  
  const equipmentData = {
    equipmentId: equipmentId,
    type: type,
    stationId: stationId,
    organizationId: station ? station.organizationId : null,
    status: status,
    lastService: lastService || null,
    notes: notes || null
  };
  
  const result = await equipmentService.updateEquipment(docId, equipmentData);
  
  if (result.success) {
    const equipmentIndex = allEquipment.findIndex(e => e.id === docId);
    if (equipmentIndex !== -1) {
      allEquipment[equipmentIndex] = { ...allEquipment[equipmentIndex], ...equipmentData };
    }
    renderEquipment();
    window.closeModal('editEquipmentModal');
    showNotification('Equipment updated successfully', 'success');
  } else {
    showNotification('Failed to update equipment: ' + result.error, 'error');
  }
  
  hideLoading();
}

// Helper functions
function populateOrganizationDropdown(selectId, selectedId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  select.innerHTML = '<option value="">Select Organization</option>';
  
  let orgsToShow = allOrganizations;
  
  // Local admins can only see their organization
  if (currentUserData.role === 'localAdmin' && currentUserData.organizationId) {
    orgsToShow = allOrganizations.filter(o => o.id === currentUserData.organizationId);
  }
  
  orgsToShow.forEach(org => {
    const option = document.createElement('option');
    option.value = org.id;
    option.textContent = org.name;
    if (selectedId && org.id === selectedId) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

async function populateStationDropdown(selectId, selectedId = null, organizationId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  select.innerHTML = '<option value="">Select Station</option>';
  
  let stationsToShow = allStations;
  
  // Filter by organization if provided
  if (organizationId) {
    stationsToShow = allStations.filter(s => s.organizationId === organizationId);
  }
  
  // Local admins can only see stations in their organization
  if (currentUserData.role === 'localAdmin' && currentUserData.organizationId) {
    stationsToShow = stationsToShow.filter(s => s.organizationId === currentUserData.organizationId);
  }
  
  stationsToShow.forEach(station => {
    const option = document.createElement('option');
    option.value = station.id;
    option.textContent = station.name;
    if (selectedId && station.id === selectedId) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

// Setup organization change listener for station dropdowns
document.addEventListener('change', function(e) {
  if (e.target.id === 'newUserOrganization') {
    populateStationDropdown('newUserStation', null, e.target.value);
  } else if (e.target.id === 'editUserOrganization') {
    populateStationDropdown('editUserStation', null, e.target.value);
  }
});

function canDeleteUser(user) {
  // Global admins can delete any user except other global admins
  if (currentUserData.role === 'globalAdmin') {
    return user.role !== 'globalAdmin';
  }
  
  // Local admins can delete users in their organization except admins
  if (currentUserData.role === 'localAdmin') {
    return user.organizationId === currentUserData.organizationId && 
           user.role !== 'globalAdmin' && 
           user.role !== 'localAdmin';
  }
  
  return false;
}

function canDeleteStation(station) {
  // Global admins can delete any station
  if (currentUserData.role === 'globalAdmin') {
    return true;
  }
  
  // Local admins can delete stations in their organization
  if (currentUserData.role === 'localAdmin') {
    return station.organizationId === currentUserData.organizationId;
  }
  
  return false;
}

function formatRole(role) {
  const roleMap = {
    'globalAdmin': 'Global Admin',
    'localAdmin': 'Local Admin',
    'tech': 'Technician',
    'user': 'User'
  };
  return roleMap[role] || role;
}

function formatStatus(status) {
  const statusMap = {
    'operational': 'Operational',
    'maintenance': 'Maintenance',
    'offline': 'Offline',
    'active': 'Active',
    'inactive': 'Inactive'
  };
  return statusMap[status] || status;
}

// Logout handler
async function handleLogout() {
  const result = await authService.signOut();
  if (result.success) {
    window.location.href = 'login.html';
  }
}

// UI helpers
function showLoading() {
  // Create or show loading overlay
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    overlay.innerHTML = '<div style="background: var(--dark); padding: 20px; border-radius: 8px;">Loading...</div>';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ec4242' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    z-index: 10001;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
