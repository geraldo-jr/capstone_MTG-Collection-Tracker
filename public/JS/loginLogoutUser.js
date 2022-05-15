let currentUserId = null;

// Update login state
function maintainLoggedIn(userId, username) {
  let loginPanel = document.getElementById("loginPanelInfo");

  // console.log(userId + " " + username);
  currentUserId = userId;
  loginPanel.innerHTML = `User Info: logged as @${username}. <a href="#" class="openBox" origin="logout" onclick="logout()">Logout</a>`;
  
  populateCardTable();

}

window.onload = async function () {
  const response = await fetch('/userLoginStatus', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  const userState = await response.json();

  if (userState.success === true) {
    
    maintainLoggedIn(userState.user_id, userState.username);

  }
}

// Login user handling code 
const loginUser = async function() {
  const uEmailLogin = document.getElementById("login-email").value;
  const uPasswordLogin = document.getElementById("login-password").value;
  
  if (uEmailLogin === "" || uPasswordLogin === "") {
    alert("Please, insert a valid username, email and password to sign in.");
  } else {
    const response = await fetch('/login_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_email: uEmailLogin,
        user_password: uPasswordLogin
      })
    });

    // Fetching for users records. If correct returns true for success and username, if incorrect returns false for success.
    const result = await response.json();
    
    if (result.success === true) {
      document.getElementById("login").style.display = "none";
      maintainLoggedIn(result.user_id, result.username);
      populateCardTable();

    } else {
      alert("User not found or the provided email or password was incorrect. Please, try again.");
    }
  }
}

function ValidateEmail(email) {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  
  if(email.match(mailformat)) {
      return (true);
  } else {
      return (false);
  }
}

// Saving user info on BD and create new account
const createNewUser = async function(id) {
  const uFirstName= document.querySelector('#first_name').value;
  const uLastName= document.querySelector('#last_name').value;
  const uUsername= document.querySelector('#username').value;
  const uEmail= document.querySelector('#email').value;
  const uPassword = document.querySelector('#pass').value;
  
  if (uUsername.trim() === "" || !ValidateEmail(uEmail) || uPassword.trim() === "") {
      alert("Please, insert a valid username, email and password to create your new account");
  } else {
    if (letter.classList.value !== "valid" || capital.classList.value !== "valid" || number.classList.value !== "valid" || length.classList.value !== "valid") {
      alert("Invalid password. Please, create a password that contains 8 charaters and at lease one uppercase letter, one lowercase letter, a symbol and a number.");
    } else {      
      const response = await fetch('/signup_user', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: uPassword,
          username: uUsername,
          email: uEmail,
          first_name: uFirstName,
          last_name: uLastName
        })
      });
      
      const result = await response.json();

      if (result.success === true) {
        maintainLoggedIn(result.user_id, result.username);

        document.getElementById("signup").style.display = "none";
        alert("New user succesfully created.");
      } else {
        alert(result.message);
      }
    }
  }

};

// User's logout from server and refresh page
const logout = async function() {

  const response = await fetch('/logout_user', {
    method: 'POST', 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 200) {
    location.reload();
  } else {
    alert("Server not responding. Please, refresh page.")
  }
};