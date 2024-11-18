// html elements
const loginRegisterScreen = document.getElementById('login_register_screen');
const profileName = document.getElementById('profile_name');
const logoutButton = document.getElementById('logout_button');
const year = document.getElementById('year');

// if user is already logged in, redirect to profile page
document.addEventListener('DOMContentLoaded', async (event) => {
    event.preventDefault();
    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/check-login', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.status === 200) {
            const user_data = await response.json();
            profileName.textContent = user_data.username;
            profileName.title = user_data.username;
            loginRegisterScreen.style.display = 'none';
        } else {
            console.log('No user data found. Please login.');
            loginRegisterScreen.style.display = 'flex';
        }
    } catch (error) {
        console.log('Error checking login status', error);
        loginRegisterScreen.style.display = 'flex';
    }
});

// log out function
async function LogOutFunction() {
    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/logout', {
            method: 'POST',
            credentials: 'include'
        });
        if (response.status === 200) {
            console.log('User logged out');
            loginRegisterScreen.style.display = 'flex';
            profileName.textContent = '';
            profileName.title = '';
        } else {
            console.log('Error logging out');
        }
    } catch (error) {
        console.log('Error logging out', error);
    }
}

// log out function
logoutButton.addEventListener('click', () => {
    LogOutFunction();
    window.location.reload();
});

// self updating year in footer
year.textContent = new Date().getFullYear();