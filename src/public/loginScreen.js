// html elements
let usernameLogin = document.getElementById('username_login').value;
let passwordLogin = document.getElementById('password_login').value;
let usernameRegister = document.getElementById('username_register').value;
let passwordRegister = document.getElementById('password_register').value;
let confirmPassword_register = document.getElementById('confirm_password_register').value;

const loginButton = document.getElementById('login_button');
const registerButton = document.getElementById('register_button');
const loginRegisterScreen = document.getElementById('login_register_screen');
const login_error = document.getElementById('login_error');
const register_error = document.getElementById('register_error');

registerButton.addEventListener('click', (event) => {
    event.preventDefault(); // prevent default form functionality
    RegisterUser(); // initate function to register user
});

async function RegisterUser() {
    const registerData = {
        username: usernameRegister.value,
        password: passwordRegister.value,
        confirmPassword: confirmPassword_register.value
    };

    try {
        const response = await fetch('http://localhost:4000/M00982633/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        register_error.innerHTML = "REGISTRATION SUCCESSFUL";
        console.log(data);
    } catch (error) {
        register_error.innerHTML = "Registration failed. Please try again.";
        console.error('Error:', error);
    }
}