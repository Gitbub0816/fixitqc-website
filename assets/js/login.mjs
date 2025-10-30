// Login functionality with Firebase Authentication
import { firebaseConfig } from './firebase-config.mjs';

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, redirect to admin
    window.location.href = 'admin.html';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const errorMsg = document.getElementById('error-message');
      
      // Clear previous error
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
      
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Success - redirect will happen via onAuthStateChanged
        console.log('Login successful');
        
      } catch (error) {
        console.error('Login error:', error);
        
        // Show error message
        if (errorMsg) {
          errorMsg.style.display = 'block';
          
          switch(error.code) {
            case 'auth/invalid-email':
              errorMsg.textContent = 'Invalid email address.';
              break;
            case 'auth/user-disabled':
              errorMsg.textContent = 'This account has been disabled.';
              break;
            case 'auth/user-not-found':
              errorMsg.textContent = 'No account found with this email.';
              break;
            case 'auth/wrong-password':
              errorMsg.textContent = 'Incorrect password.';
              break;
            case 'auth/invalid-credential':
              errorMsg.textContent = 'Invalid email or password.';
              break;
            default:
              errorMsg.textContent = 'Login failed. Please try again.';
          }
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }
});
