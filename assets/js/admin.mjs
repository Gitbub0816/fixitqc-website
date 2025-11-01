// Admin Console - DIAGNOSTIC VERSION
// Shows exactly where things fail

import { 
  authService, 
  userService, 
  organizationService, 
  stationService, 
  equipmentService 
} from './firebase-service.mjs';

console.log('🚀 [1] Admin.mjs loaded');

let currentUser = null;
let currentUserData = null;
let authCheckComplete = false;

function showMessage(msg, isLoading = true) {
  console.log('📢 Showing message:', msg);
  const authWall = document.getElementById('authWall');
  const authMessage = document.getElementById('authMessage');
  const authLoading = document.getElementById('authLoading');
  const authActions = document.getElementById('authActions');
  
  if (authWall && authMessage) {
    authWall.style.display = 'flex';
    authMessage.textContent = msg;
    if (authLoading) authLoading.style.display = isLoading ? 'block' : 'none';
    if (authActions) authActions.style.display = isLoading ? 'none' : 'block';
  }
}

function showAdminContent() {
  console.log('✅ [FINAL] Showing admin content');
  const authWall = document.getElementById('authWall');
  const adminContent = document.getElementById('adminContent');
  
  if (authWall) authWall.style.display = 'none';
  if (adminContent) adminContent.style.display = 'block';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

async function initAdmin() {
  console.log('🚀 [2] DOM Ready - Starting initialization');
  
  showMessage('Step 1: Checking DOM elements...');
  
  const authWall = document.getElementById('authWall');
  const adminContent = document.getElementById('adminContent');
  
  if (!authWall || !adminContent) {
    console.error('❌ [ERROR] Auth wall or admin content not found!');
    alert('Page structure error. Auth wall or admin content missing.');
    return;
  }
  
  console.log('✅ [3] DOM elements found');
  showMessage('Step 2: Checking Firebase...');
  
  // Check if authService exists
  if (!authService) {
    console.error('❌ [ERROR] authService not available!');
    showMessage('ERROR: Firebase auth service not loaded', false);
    return;
  }
  
  console.log('✅ [4] AuthService available');
  showMessage('Step 3: Setting up auth listener...');
  
  const timeout = setTimeout(() => {
    if (!authCheckComplete) {
      console.error('⏱️ [TIMEOUT] Auth check took too long');
      showMessage('Authentication timeout. Firebase may not be responding.', false);
    }
  }, 10000);
  
  try {
    console.log('🔐 [5] Registering auth state listener...');
    
    authService.onAuthStateChanged(async (user) => {
      console.log('🔔 [6] Auth state changed callback fired!');
      clearTimeout(timeout);
      authCheckComplete = true;
      
      if (!user) {
        console.log('❌ [7] No user signed in');
        showMessage('Not signed in. Please sign in to continue.', false);
        return;
      }
      
      console.log('✅ [8] User signed in:', user.email);
      console.log('🆔 [9] User UID:', user.uid);
      currentUser = user;
      
      showMessage('Step 4: Loading user profile...');
      
      try {
        console.log('📥 [10] Fetching user document from Firestore...');
        const result = await userService.getUserByAuthId(user.uid);
        
        console.log('📊 [11] User fetch result:', result);
        
        if (!result.success) {
          console.error('❌ [12] User document not found:', result.error);
          showMessage(`User document not found: ${result.error}`, false);
          return;
        }
        
        currentUserData = result.data;
        console.log('✅ [13] User document loaded:', currentUserData);
        console.log('👤 [14] User role:', currentUserData.role);
        
        showMessage('Step 5: Checking permissions...');
        
        if (currentUserData.role !== 'globalAdmin' && currentUserData.role !== 'localAdmin') {
          console.error('❌ [15] Access denied. Role:', currentUserData.role);
          showMessage(`Access denied. Your role: ${currentUserData.role}`, false);
          return;
        }
        
        console.log('✅ [16] User is admin!');
        showMessage('Step 6: Loading admin panel...');
        
        // Display user email
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
          userEmailEl.textContent = user.email;
          console.log('✅ [17] User email displayed');
        }
        
        console.log('🎨 [18] Initializing admin panel components...');
        
        // Setup components
        setupLogout();
        setupTabs();
        setupModals();
        initHamburgerMenu();
        
        console.log('✅ [19] Components initialized');
        showMessage('Step 7: Loading data...');
        
        // Load data
        await loadAllData();
        
        console.log('✅ [20] All data loaded');
        console.log('🎉 [21] SUCCESS! Showing admin console');
        
        // Show admin content
        showAdminContent();
        
      } catch (error) {
        console.error('❌ [ERROR] Exception during user check:', error);
        console.error('Error stack:', error.stack);
        showMessage(`Error: ${error.message}`, false);
      }
    });
    
    console.log('✅ [22] Auth listener registered successfully');
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ [ERROR] Failed to setup auth:', error);
    console.error('Error stack:', error.stack);
    showMessage(`Error setting up authentication: ${error.message}`, false);
  }
  
  console.log('✅ [23] Init function complete');
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authService.signOut();
      window.location.href = 'login.html';
    });
    console.log('✅ Logout button setup');
  }
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  console.log('📑 Setting up', tabButtons.length, 'tabs');

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
  
  console.log('✅ Tabs setup complete');
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
  
  console.log('✅ Modals setup complete');
}

function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const cascade = document.getElementById('cascade');
  
  if (!hamburger || !cascade) {
    console.log('⚠️ Hamburger menu elements not found');
    return;
  }
  
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
  
  console.log('✅ Hamburger menu initialized');
}

async function loadAllData() {
  console.log('📊 Loading all data...');
  
  try {
    const [orgsResult, stationsResult, equipmentResult, usersResult] = await Promise.all([
      organizationService.getAllOrganizations(),
      stationService.getAllStations(),
      equipmentService.getAllEquipment(),
      userService.getAllUsers()
    ]);
    
    console.log('✅ Organizations:', orgsResult.success ? orgsResult.data.length : 'failed');
    console.log('✅ Stations:', stationsResult.success ? stationsResult.data.length : 'failed');
    console.log('✅ Equipment:', equipmentResult.success ? equipmentResult.data.length : 'failed');
    console.log('✅ Users:', usersResult.success ? usersResult.data.length : 'failed');
    
    // Render data
    if (orgsResult.success) renderOrganizationsList(orgsResult.data);
    if (stationsResult.success) renderStationsList(stationsResult.data);
    if (equipmentResult.success) renderEquipmentList(equipmentResult.data);
    if (usersResult.success) renderUsersList(usersResult.data);
    
    setupAllFormHandlers();
    
    console.log('✅ All data loaded and rendered');
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
}

function renderOrganizationsList(orgs) {
  const container = document.getElementById('organizationsList');
  if (!container) return;
  
  if (orgs.length === 0) {
    container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No organizations yet. Click "Add Organization" to create one.</p>';
    return;
  }
  
  container.innerHTML = orgs.map(org => `
    <div style="margin-bottom:16px;padding:20px;background:var(--panel);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin:0 0 8px 0;color:var(--copper);">${org.name}</h3>
      <p style="margin:4px 0;color:var(--muted);">📧 ${org.contactEmail || 'No email'}</p>
      <p style="margin:4px 0;color:var(--muted);">📞 ${org.phone || 'No phone'}</p>
    </div>
  `).join('');
}

function renderStationsList(stations) {
  const container = document.getElementById('stationsList');
  if (!container) return;
  
  if (stations.length === 0) {
    container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No stations yet.</p>';
    return;
  }
  
  container.innerHTML = stations.map(station => `
    <div style="margin-bottom:16px;padding:20px;background:var(--panel);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin:0 0 8px 0;color:var(--copper);">${station.name}</h3>
      <p style="margin:4px 0;color:var(--muted);">📍 ${station.location || 'No location'}</p>
    </div>
  `).join('');
}

function renderEquipmentList(equipment) {
  const container = document.getElementById('equipmentList');
  if (!container) return;
  
  if (equipment.length === 0) {
    container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No equipment yet.</p>';
    return;
  }
  
  container.innerHTML = equipment.map(item => `
    <div style="margin-bottom:16px;padding:20px;background:var(--panel);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin:0 0 8px 0;color:var(--copper);">${item.name}</h3>
      <p style="margin:4px 0;color:var(--muted);">🔧 ${item.type || 'No type'}</p>
    </div>
  `).join('');
}

function renderUsersList(users) {
  const container = document.getElementById('usersList');
  if (!container) return;
  
  if (users.length === 0) {
    container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No users yet.</p>';
    return;
  }
  
  container.innerHTML = users.map(user => `
    <div style="margin-bottom:16px;padding:20px;background:var(--panel);border:1px solid var(--border);border-radius:12px;">
      <h3 style="margin:0 0 8px 0;color:var(--copper);">${user.name || 'Unnamed'}</h3>
      <p style="margin:4px 0;color:var(--muted);">📧 ${user.email}</p>
      <p style="margin:4px 0;color:var(--muted);">👤 ${user.role}</p>
    </div>
  `).join('');
}

function setupAllFormHandlers() {
  console.log('📝 Setting up form handlers...');
  // Simplified for diagnostic - just log when forms are submitted
  const forms = document.querySelectorAll('form');
  forms.forEach((form, idx) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log(`Form ${idx} submitted`);
      alert('Form submission - feature coming soon!');
    });
  });
}

console.log('✅ [LOADED] Diagnostic admin.mjs fully loaded');
