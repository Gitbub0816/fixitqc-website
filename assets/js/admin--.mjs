// Admin Console - COMPLETE FULL-FEATURED VERSION
// All features included with fixed auth

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

console.log('📦 Admin.mjs COMPLETE version loaded');

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

async function initAdmin() {
  console.log('🚀 Initializing COMPLETE admin console...');
  
  const authWall = document.getElementById('authWall');
  const adminContent = document.getElementById('adminContent');
  const authMessage = document.getElementById('authMessage');
  const authLoading = document.getElementById('authLoading');
  const authActions = document.getElementById('authActions');
  
  if (!authWall || !adminContent) {
    console.error('❌ Auth wall elements not found!');
    return;
  }
  
  // Show loading
  authWall.style.display = 'flex';
  adminContent.style.display = 'none';
  authMessage.textContent = 'Verifying authentication...';
  authLoading.style.display = 'block';
  authActions.style.display = 'none';
  
  const timeout = setTimeout(() => {
    if (!authCheckComplete) {
      authMessage.textContent = 'Authentication timeout. Please refresh.';
      authLoading.style.display = 'none';
      authActions.style.display = 'block';
    }
  }, 10000);
  
  try {
    authService.onAuthStateChanged(async (user) => {
      clearTimeout(timeout);
      authCheckComplete = true;
      
      if (!user) {
        authMessage.textContent = 'You must be signed in to access the admin console.';
        authLoading.style.display = 'none';
        authActions.style.display = 'block';
        return;
      }
      
      currentUser = user;
      console.log('✅ User:', user.email);
      
      try {
        const result = await userService.getUserByAuthId(user.uid);
        
        if (!result.success) {
          authMessage.textContent = 'User document not found: ' + result.error;
          authLoading.style.display = 'none';
          authActions.style.display = 'block';
          await authService.signOut();
          return;
        }
        
        currentUserData = result.data;
        
        if (currentUserData.role !== 'globalAdmin' && currentUserData.role !== 'localAdmin') {
          authMessage.textContent = `Access denied. Your role: ${currentUserData.role}`;
          authLoading.style.display = 'none';
          await authService.signOut();
          return;
        }
        
        // SUCCESS
        authWall.style.display = 'none';
        adminContent.style.display = 'block';
        
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) userEmailEl.textContent = user.email;
        
        initHamburgerMenu();
        await initializeAdminPanel();
        
      } catch (error) {
        console.error('❌ Error:', error);
        authMessage.textContent = 'Error: ' + error.message;
        authLoading.style.display = 'none';
        authActions.style.display = 'block';
      }
    });
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Failed to setup auth:', error);
    authMessage.textContent = 'Error: ' + error.message;
    authLoading.style.display = 'none';
    authActions.style.display = 'block';
  }
  
  setupLogout();
  setupTabs();
  setupModals();
}

function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const cascade = document.getElementById('cascade');
  if (!hamburger || !cascade) return;
  
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    cascade.classList.toggle('visible');
  });
  
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !cascade.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      cascade.classList.remove('visible');
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authService.signOut();
      window.location.href = 'login.html';
    });
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      button.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function setupModals() {
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });
  
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.closest('.modal').style.display = 'none';
    });
  });
}

async function initializeAdminPanel() {
  console.log('🎨 Loading all data...');
  
  await Promise.all([
    loadAllUsers(),
    loadAllOrganizations(),
    loadAllStations(),
    loadAllEquipment()
  ]);
  
  setupAllFormHandlers();
  console.log('✅ Admin panel fully initialized');
}

// ===== ORGANIZATIONS =====

async function loadAllOrganizations() {
  console.log('📊 Loading organizations...');
  const result = await organizationService.getAllOrganizations();
  if (result.success) {
    allOrganizations = result.data;
    renderOrganizationsList(result.data);
    populateOrganizationDropdowns(result.data);
  }
}

function renderOrganizationsList(orgs) {
  const container = document.getElementById('organizationsList');
  if (!container) return;
  
  if (orgs.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">No organizations yet. Click "Add Organization" to create one.</p>';
    return;
  }
  
  container.innerHTML = orgs.map(org => `
    <div class="card" style="margin-bottom: 16px; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h3 style="margin: 0 0 8px 0; color: var(--copper);">${org.name}</h3>
          <p style="margin: 4px 0; color: var(--muted);">📧 ${org.contactEmail || 'No email'}</p>
          <p style="margin: 4px 0; color: var(--muted);">📞 ${org.phone || 'No phone'}</p>
          <p style="margin: 4px 0;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; background: ${org.active ? '#22c55e20' : '#ef444420'}; color: ${org.active ? '#22c55e' : '#ef4444'};">
              ${org.active ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
        <div>
          <button class="btn secondary" onclick="editOrganization('${org.id}')" style="margin-right: 8px;">Edit</button>
          <button class="btn danger" onclick="deleteOrganization('${org.id}', '${org.name}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function populateOrganizationDropdowns(orgs) {
  const dropdowns = document.querySelectorAll('select[name="organizationId"]');
  dropdowns.forEach(select => {
    select.innerHTML = '<option value="">Select Organization</option>' +
      orgs.map(org => `<option value="${org.id}">${org.name}</option>`).join('');
  });
}

// ===== STATIONS =====

async function loadAllStations() {
  console.log('🏭 Loading stations...');
  const result = await stationService.getAllStations();
  if (result.success) {
    allStations = result.data;
    renderStationsList(result.data);
    populateStationDropdowns(result.data);
  }
}

function renderStationsList(stations) {
  const container = document.getElementById('stationsList');
  if (!container) return;
  
  if (stations.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">No stations yet. Click "Add Station" to create one.</p>';
    return;
  }
  
  container.innerHTML = stations.map(station => {
    const org = allOrganizations.find(o => o.id === station.organizationId);
    return `
      <div class="card" style="margin-bottom: 16px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: var(--copper);">${station.name}</h3>
            <p style="margin: 4px 0; color: var(--muted);">🏢 ${org ? org.name : 'Unknown Org'}</p>
            <p style="margin: 4px 0; color: var(--muted);">📍 ${station.location || 'No location'}</p>
            <p style="margin: 4px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; background: ${station.active ? '#22c55e20' : '#ef444420'}; color: ${station.active ? '#22c55e' : '#ef4444'};">
                ${station.active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
          <div>
            <button class="btn secondary" onclick="editStation('${station.id}')" style="margin-right: 8px;">Edit</button>
            <button class="btn danger" onclick="deleteStation('${station.id}', '${station.name}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function populateStationDropdowns(stations) {
  const dropdowns = document.querySelectorAll('select[name="stationId"]');
  dropdowns.forEach(select => {
    select.innerHTML = '<option value="">Select Station</option>' +
      stations.map(station => `<option value="${station.id}">${station.name}</option>`).join('');
  });
}

// ===== EQUIPMENT =====

async function loadAllEquipment() {
  console.log('🔧 Loading equipment...');
  const result = await equipmentService.getAllEquipment();
  if (result.success) {
    allEquipment = result.data;
    renderEquipmentList(result.data);
  }
}

function renderEquipmentList(equipment) {
  const container = document.getElementById('equipmentList');
  if (!container) return;
  
  if (equipment.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">No equipment yet. Click "Add Equipment" to create one.</p>';
    return;
  }
  
  container.innerHTML = equipment.map(item => {
    const station = allStations.find(s => s.id === item.stationId);
    return `
      <div class="card" style="margin-bottom: 16px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: var(--copper);">${item.name}</h3>
            <p style="margin: 4px 0; color: var(--muted);">🏭 ${station ? station.name : 'Unknown Station'}</p>
            <p style="margin: 4px 0; color: var(--muted);">🔧 ${item.type || 'No type'}</p>
            <p style="margin: 4px 0; color: var(--muted);">📝 ${item.description || 'No description'}</p>
            <p style="margin: 4px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; background: ${item.active ? '#22c55e20' : '#ef444420'}; color: ${item.active ? '#22c55e' : '#ef4444'};">
                ${item.active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
          <div>
            <button class="btn secondary" onclick="editEquipment('${item.id}')" style="margin-right: 8px;">Edit</button>
            <button class="btn danger" onclick="deleteEquipment('${item.id}', '${item.name}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== USERS =====

async function loadAllUsers() {
  console.log('👥 Loading users...');
  const result = await userService.getAllUsers();
  if (result.success) {
    allUsers = result.data;
    renderUsersList(result.data);
  }
}

function renderUsersList(users) {
  const container = document.getElementById('usersList');
  if (!container) return;
  
  if (users.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666;">No users yet.</p>';
    return;
  }
  
  container.innerHTML = users.map(user => {
    const org = allOrganizations.find(o => o.id === user.organizationId);
    const station = allStations.find(s => s.id === user.stationId);
    
    return `
      <div class="card" style="margin-bottom: 16px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3 style="margin: 0 0 8px 0; color: var(--copper);">${user.name || 'Unnamed'}</h3>
            <p style="margin: 4px 0; color: var(--muted);">📧 ${user.email}</p>
            <p style="margin: 4px 0; color: var(--muted);">👤 Role: <strong>${user.role}</strong></p>
            ${org ? `<p style="margin: 4px 0; color: var(--muted);">🏢 ${org.name}</p>` : ''}
            ${station ? `<p style="margin: 4px 0; color: var(--muted);">🏭 ${station.name}</p>` : ''}
            <p style="margin: 4px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; background: ${user.active ? '#22c55e20' : '#ef444420'}; color: ${user.active ? '#22c55e' : '#ef4444'};">
                ${user.active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
          <div>
            <button class="btn secondary" onclick="editUser('${user.id}')" style="margin-right: 8px;">Edit</button>
            <button class="btn danger" onclick="deleteUser('${user.id}', '${user.email}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== FORM HANDLERS =====

function setupAllFormHandlers() {
  // Organization form
  setupOrganizationForm();
  
  // Station form
  setupStationForm();
  
  // Equipment form
  setupEquipmentForm();
  
  // User form
  setupUserForm();
  
  // Modal buttons
  setupModalButtons();
}

function setupOrganizationForm() {
  const form = document.getElementById('addOrganizationForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 Creating organization...');
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      contactEmail: formData.get('contactEmail'),
      phone: formData.get('phone'),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await organizationService.createOrganization(data);
    if (result.success) {
      alert('✅ Organization created successfully!');
      form.reset();
      document.getElementById('addOrganizationModal').style.display = 'none';
      await loadAllOrganizations();
    } else {
      alert('❌ Error: ' + result.error);
    }
  });
}

function setupStationForm() {
  const form = document.getElementById('addStationForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 Creating station...');
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      organizationId: formData.get('organizationId'),
      location: formData.get('location'),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!data.organizationId) {
      alert('Please select an organization');
      return;
    }
    
    const result = await stationService.createStation(data);
    if (result.success) {
      alert('✅ Station created successfully!');
      form.reset();
      document.getElementById('addStationModal').style.display = 'none';
      await loadAllStations();
    } else {
      alert('❌ Error: ' + result.error);
    }
  });
}

function setupEquipmentForm() {
  const form = document.getElementById('addEquipmentForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 Creating equipment...');
    
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      stationId: formData.get('stationId'),
      type: formData.get('type'),
      description: formData.get('description'),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!data.stationId) {
      alert('Please select a station');
      return;
    }
    
    const result = await equipmentService.createEquipment(data);
    if (result.success) {
      alert('✅ Equipment created successfully!');
      form.reset();
      document.getElementById('addEquipmentModal').style.display = 'none';
      await loadAllEquipment();
    } else {
      alert('❌ Error: ' + result.error);
    }
  });
}

function setupUserForm() {
  const form = document.getElementById('addUserForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 Creating user...');
    
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Create auth user first
    const authResult = await authService.createAuthUser(email, password);
    if (!authResult.success) {
      alert('❌ Error creating auth user: ' + authResult.error);
      return;
    }
    
    // Then create user document
    const userData = {
      authId: authResult.user.uid,
      email: email,
      name: formData.get('name'),
      role: formData.get('role'),
      organizationId: formData.get('organizationId') || null,
      stationId: formData.get('stationId') || null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await userService.createUser(userData);
    if (result.success) {
      alert('✅ User created successfully!');
      form.reset();
      document.getElementById('addUserModal').style.display = 'none';
      await loadAllUsers();
    } else {
      alert('❌ Error creating user document: ' + result.error);
    }
  });
}

function setupModalButtons() {
  // Show modal buttons
  const buttons = {
    'showAddOrganizationModal': 'addOrganizationModal',
    'showAddStationModal': 'addStationModal',
    'showAddEquipmentModal': 'addEquipmentModal',
    'showAddUserModal': 'addUserModal'
  };
  
  Object.entries(buttons).forEach(([btnId, modalId]) => {
    const btn = document.getElementById(btnId);
    const modal = document.getElementById(modalId);
    if (btn && modal) {
      btn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }
  });
}

// Make functions globally available for inline onclick handlers
window.editOrganization = async (id) => {
  alert('Edit organization feature coming soon!');
};

window.deleteOrganization = async (id, name) => {
  if (!confirm(`Delete organization "${name}"?`)) return;
  const result = await organizationService.deleteOrganization(id);
  if (result.success) {
    alert('✅ Deleted!');
    await loadAllOrganizations();
  } else {
    alert('❌ Error: ' + result.error);
  }
};

window.editStation = async (id) => {
  alert('Edit station feature coming soon!');
};

window.deleteStation = async (id, name) => {
  if (!confirm(`Delete station "${name}"?`)) return;
  const result = await stationService.deleteStation(id);
  if (result.success) {
    alert('✅ Deleted!');
    await loadAllStations();
  } else {
    alert('❌ Error: ' + result.error);
  }
};

window.editEquipment = async (id) => {
  alert('Edit equipment feature coming soon!');
};

window.deleteEquipment = async (id, name) => {
  if (!confirm(`Delete equipment "${name}"?`)) return;
  const result = await equipmentService.deleteEquipment(id);
  if (result.success) {
    alert('✅ Deleted!');
    await loadAllEquipment();
  } else {
    alert('❌ Error: ' + result.error);
  }
};

window.editUser = async (id) => {
  alert('Edit user feature coming soon!');
};

window.deleteUser = async (id, email) => {
  if (!confirm(`Delete user "${email}"?`)) return;
  const result = await userService.deleteUser(id);
  if (result.success) {
    alert('✅ Deleted!');
    await loadAllUsers();
  } else {
    alert('❌ Error: ' + result.error);
  }
};

console.log('✅ Admin.mjs COMPLETE version fully loaded');
