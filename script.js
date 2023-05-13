
var passwordField = document.getElementById('password');
var eyeIcon = document.querySelector('#eye-icon');

eyeIcon.addEventListener('click', function() {
console.log("eye")
    if (passwordField.type === 'password') {
    passwordField.type = 'text';
} else {
    passwordField.type = 'password';
}
});
var passwordconfrimField = document.getElementById('confirm-password');
var eyeIcon = document.querySelector('#eye-icon1');
eyeIcon.addEventListener('click', function() {
console.log("eye")
    if (passwordconfrimField.type === 'password') {
    passwordconfrimField.type = 'text';
} else {
    passwordconfrimField.type = 'password';
}
});
const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name , email, username, password })
    });
    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        window.location.href = '/dashboard.html';
    } else {
        alert(data.message);
    }
});
  // google login 

function handleGoogleAuthSuccess(idToken) {
    // Send the ID token to the backend
    console.log("working the api");
    fetch('/api/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: idToken })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        console.log(data.message);
        if (data.token) {
            alert(data.message);
            window.location.href = '/dashboard.html';
        } else {
            alert('There was a problem with the authentication');
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('There was a problem with the fetch operation');
    });
}

function handleCredentialResponse(response) {
    var token = response.credential
    handleGoogleAuthSuccess(token);
    console.log("Encoded JWT ID token: " + token);
}
window.onload = function () {
        google.accounts.id.initialize({
        client_id: "76254011998-4i57qv7m68c93npphlroc0vnfjmgbp8j.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }  // customization attributes
    );

}
