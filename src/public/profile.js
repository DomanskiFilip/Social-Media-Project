// html elements
const loginRegisterScreen = document.getElementById('login_register_screen');
const profileName = document.getElementById('profile_name');
const logoutButton = document.getElementById('logout_button');
const year = document.getElementById('year');

// if user is already logged in, redirect to profile page
document.addEventListener('DOMContentLoaded', () => {
    const user_data = JSON.parse(sessionStorage.getItem('user_data'));
    if (user_data) {    
        profileName.textContent = user_data.username;
        profileName.title = user_data.username;
        loginRegisterScreen.style.display = 'none';
    } else {
        console.log('No user data found. Please login.');
        loginRegisterScreen.style.display = 'flex';
    }
});

// log out function
logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('user_data');
    window.location.reload();
});

// self updateing year in footer
year.textContent = new Date().getFullYear();