// html elements
let usernameLogin = document.getElementById('username_login');
let passwordLogin = document.getElementById('password_login');
let usernameRegister = document.getElementById('username_register');
let passwordRegister = document.getElementById('password_register');
let confirmPasswordRegister = document.getElementById('confirm_password_register');

const loginButton = document.getElementById('login_button');
const registerButton = document.getElementById('register_button');
const loginRegisterScreen = document.getElementById('login_register_screen');
const loginError = document.getElementById('login_error');
const registerError = document.getElementById('register_error');
const registerForm = document.getElementById('register_form');
const registerSucces = document.getElementById('register_succes');
const profileName = document.getElementById('profile_name');

// registering new users functionality
registerButton.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default form functionality
    RegisterUser(); // initate function to register user
});

async function RegisterUser() {
    // check if username and password are not empty
    if (usernameRegister.value === "" || passwordRegister.value === "") {
        registerError.innerHTML = "Please enter a username and password";
        return;
    } else if (passwordRegister.value !== confirmPasswordRegister.value) {
        // check if password and confirm password match
        registerError.innerHTML = "Passwords do not match";
        return;
    } else if (passwordRegister.value.length < 8 || !/\d/.test(passwordRegister.value)) {
        // password must be at least 8 characters long and have at least one number
        registerError.innerHTML = "Password must be at least 8 characters long and have at least one number";
        return;
    } else if (usernameRegister.value.length > 15 || passwordRegister.value.length > 15) {
        // username and password must be less than 15 characters
        registerError.innerHTML = "Username and password must be less than 15 characters";
        return;
    }

    const registerData = {
        username: usernameRegister.value,
        password: passwordRegister.value,
    };


    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        registerForm.style.display = 'none';
        registerSucces.textContent = "Registration successful. Please login.";
    } catch (error) {
        registerError.innerHTML = "Registration failed. Please try again.";
    }
}


// login functionality
loginButton.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default form functionality
    LoginUser(); // initate function to login user
});

async function LoginUser() {
    // check if username and password are not empty
    if (usernameLogin.value === "" || passwordLogin.value === "") {
        loginError.innerHTML = "Please enter your username and password";
        return;
    }

    const loginData = {
        username: usernameLogin.value,
        password: passwordLogin.value,
    };

    try {
        const response = await fetch('http://127.0.0.1:4000/M00982633/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
            const user_data = await response.json();
            sessionStorage.setItem('user_data', JSON.stringify(user_data));
            profileName.textContent = user_data.username;
            profileName.title = user_data.username;
            loginRegisterScreen.style.display = 'none';
    } catch (error) {
        loginError.innerHTML = "Please try again";
        return null;
    }
}