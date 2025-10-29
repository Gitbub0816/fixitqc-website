// Login page functionality
// This is a placeholder - requires Firebase SDK to function

console.log('Login module loaded');

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      loginStatus.textContent = 'Demo mode - Firebase auth not configured';
      loginStatus.style.color = 'var(--muted)';
      
      // In production, this would use Firebase auth
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 1500);
    });
  }
});
