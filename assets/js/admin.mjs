// Admin page functionality
// This is a placeholder - requires Firebase SDK to function

console.log('Admin module loaded');

document.addEventListener('DOMContentLoaded', function() {
  // Show admin content immediately in demo mode
  const authLoader = document.getElementById('authLoader');
  const adminContent = document.getElementById('adminContent');
  const userEmail = document.getElementById('userEmail');
  
  setTimeout(() => {
    authLoader.style.display = 'none';
    adminContent.style.display = 'block';
    userEmail.textContent = 'demo@fixitqc.com';
  }, 500);
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      window.location.href = 'login.html';
    });
  }
});
