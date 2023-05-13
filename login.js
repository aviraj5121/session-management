    // chnaging the type of the input in password  to show the password in text form 
    const loginBtn = document.getElementById("login-btn");
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    // login button to send the code to the server 
    loginBtn.addEventListener('click', async (event) => {
      event.preventDefault(); // to prevent reload to of the page
      console.log("login  click")//to check if code is working 
      const username = usernameInput.value;
      const password = passwordInput.value;
      const response = await fetch('/api/login', {
        method: 'POST', // use to submit the data on server 
        headers: {
          'Content-Type': 'application/json' // type of contain we want to send to the server
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json(); // get the respone in of data in js form 

      if (response.ok) {
        // Save JWT token to local storage
        localStorage.setItem('token', data.token); // if response is ok then it save the data to token in local stroage 
        
        // Redirect to dashboard
        window.location.href = '/dashboard.html'; // then navigate to the dashboard.html
      } else {
        // Display error message
        alert(data.message); // else show the message (error message )
      }
    });

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
    