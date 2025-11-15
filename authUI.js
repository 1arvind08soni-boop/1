/**
 * Authentication UI Manager
 * Handles user login, registration, and authentication flows
 */

const AuthUIManager = {
    currentUser: null,
    
    /**
     * Initialize authentication on app startup
     */
    async initialize() {
        console.log('AuthUIManager: Starting initialization...');
        
        if (!window.electronAPI || !window.electronAPI.auth) {
            console.warn('Auth API not available');
            return true; // Continue without auth
        }
        
        // Check if user is already logged in
        const user = await window.electronAPI.auth.getCurrentUser();
        console.log('Current user check:', user);
        
        if (user) {
            this.currentUser = user;
            console.log('User already logged in:', user.username);
            // User is authenticated - hide login screen, show company selection
            this.hideLoginScreen();
            return true; // User is logged in
        }
        
        // Check if any users exist
        const users = await window.electronAPI.auth.getAllUsers();
        console.log('Total users in system:', users.length);
        
        if (users.length === 0) {
            // No users exist - show first-time setup
            console.log('No users found, showing first-time setup');
            this.showFirstTimeSetup();
            return false;
        } else {
            // Users exist - show login screen
            console.log('Users found, showing login screen');
            this.showLoginScreen();
            return false;
        }
    },
    
    /**
     * Hide login screen and show company selection
     */
    hideLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const companyScreen = document.getElementById('companySelectionScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (companyScreen) {
            companyScreen.style.display = 'flex';
        }
        if (mainApp) {
            mainApp.style.display = 'none';
        }
        
        console.log('Login screen hidden, company selection shown');
    },
    
    /**
     * Show login screen
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const companyScreen = document.getElementById('companySelectionScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        if (companyScreen) {
            companyScreen.style.display = 'none';
        }
        if (mainApp) {
            mainApp.style.display = 'none';
        }
        
        console.log('Login screen displayed');
        
        // Focus on username field
        setTimeout(() => {
            const usernameField = document.getElementById('loginUsername');
            if (usernameField) usernameField.focus();
        }, 100);
        
        // Add enter key listener
        const passwordField = document.getElementById('loginPassword');
        if (passwordField) {
            passwordField.removeEventListener('keypress', handleLoginKeypress); // Remove old listeners
            passwordField.addEventListener('keypress', handleLoginKeypress);
        }
    },
    
    /**
     * Show first-time setup screen
     */
    showFirstTimeSetup() {
        const modal = document.createElement('div');
        modal.className = 'license-modal-overlay';
        modal.innerHTML = `
            <div class="license-modal">
                <h2 style="margin-bottom: 20px;">
                    <i class="fas fa-user-plus"></i> Create Your Account
                </h2>
                <p style="color: #666; margin-bottom: 20px;">
                    Welcome! Create an account to get started.
                </p>
                <div class="login-form">
                    <div class="form-group">
                        <label for="setupUsername">Username:</label>
                        <input type="text" id="setupUsername" class="form-control" placeholder="Choose a username" autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="setupFullName">Full Name:</label>
                        <input type="text" id="setupFullName" class="form-control" placeholder="Enter your full name">
                    </div>
                    <div class="form-group">
                        <label for="setupPassword">Password:</label>
                        <input type="password" id="setupPassword" class="form-control" placeholder="Choose a password (min 4 characters)" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="setupConfirmPassword">Confirm Password:</label>
                        <input type="password" id="setupConfirmPassword" class="form-control" placeholder="Confirm your password" autocomplete="new-password">
                    </div>
                    <div id="setupError" style="color: red; margin: 10px 0; display: none;"></div>
                    <button class="btn btn-primary btn-block" onclick="AuthUIManager.handleFirstTimeSetup()">
                        <i class="fas fa-check"></i> Create Account
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            const usernameField = document.getElementById('setupUsername');
            if (usernameField) usernameField.focus();
        }, 100);
    },
    
    /**
     * Handle first-time setup
     */
    async handleFirstTimeSetup() {
        const username = document.getElementById('setupUsername').value.trim();
        const fullName = document.getElementById('setupFullName').value.trim();
        const password = document.getElementById('setupPassword').value;
        const confirmPassword = document.getElementById('setupConfirmPassword').value;
        const errorDiv = document.getElementById('setupError');
        
        if (!username) {
            errorDiv.textContent = 'Please enter a username';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (!fullName) {
            errorDiv.textContent = 'Please enter your full name';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (password.length < 4) {
            errorDiv.textContent = 'Password must be at least 4 characters';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }
        
        console.log('Creating new user:', username);
        
        const result = await window.electronAPI.auth.createUser(username, password, fullName);
        
        console.log('User creation result:', result);
        
        if (result.success) {
            // Auto-login after creation
            const loginResult = await window.electronAPI.auth.login(username, password);
            
            console.log('Auto-login result:', loginResult);
            
            if (loginResult.success) {
                this.currentUser = loginResult.user;
                
                // Remove modal
                const modal = document.querySelector('.license-modal-overlay');
                if (modal) modal.remove();
                
                // Hide login screen and show company selection
                this.hideLoginScreen();
                
                // Update the user display
                await displayCurrentUserInfo();
                
                // Initialize the app
                if (typeof loadFromStorage === 'function') {
                    loadFromStorage();
                }
                if (typeof initializeApp === 'function') {
                    initializeApp();
                }
                
                console.log('First-time setup complete, app initialized');
            } else {
                errorDiv.textContent = 'User created but auto-login failed';
                errorDiv.style.display = 'block';
            }
        } else {
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }
    },
    
    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.currentUser;
    }
};

// Helper function for keyboard event
function handleLoginKeypress(e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
}

// Global functions for onclick handlers
async function handleLogin() {
    console.log('Login attempt started');
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    console.log('Attempting login for user:', username);
    
    const result = await window.electronAPI.auth.login(username, password);
    
    console.log('Login result:', result);
    
    if (result.success) {
        AuthUIManager.currentUser = result.user;
        console.log('Login successful, user:', result.user.username);
        
        // Hide login screen and show company selection
        AuthUIManager.hideLoginScreen();
        
        // Update the user display
        await displayCurrentUserInfo();
        
        // Initialize the app if not already done
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    } else {
        errorDiv.textContent = result.message || 'Invalid username or password';
        errorDiv.style.display = 'block';
        console.error('Login failed:', result.message);
    }
}

function showFirstTimeSetup() {
    AuthUIManager.showFirstTimeSetup();
}
