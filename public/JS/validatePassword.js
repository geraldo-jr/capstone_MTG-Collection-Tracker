let passwordValue = document.getElementById("pass");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");

// When the user clicks on the password field, show the message box
passwordValue.onfocus = function() {
  document.getElementById("password-message").style.display = "block";
}

// When the user clicks outside of the password field, hide the message box
passwordValue.onblur = function() {
  document.getElementById("password-message").style.display = "none";
}

// When the user starts to type something inside the password field
passwordValue.onkeyup = function() {
  // Validate lowercase letters
  var lowerCaseLetters = /[a-z]/g;
  if(passwordValue.value.match(lowerCaseLetters)) {
    letter.classList.remove("invalid");
    letter.classList.add("valid");
  } else {
    letter.classList.remove("valid");
    letter.classList.add("invalid");
  }

  // Validate capital letters
  var upperCaseLetters = /[A-Z]/g;
  if(passwordValue.value.match(upperCaseLetters)) {
    capital.classList.remove("invalid");
    capital.classList.add("valid");
  } else {
    capital.classList.remove("valid");
    capital.classList.add("invalid");
  }

  // Validate numbers
  var numbers = /[0-9]/g;
  if(passwordValue.value.match(numbers)) {
    number.classList.remove("invalid");
    number.classList.add("valid");
  } else {
    number.classList.remove("valid");
    number.classList.add("invalid");
  }

  // Validate length
  if(passwordValue.value.length >= 8) {
    length.classList.remove("invalid");
    length.classList.add("valid");
  } else {
    length.classList.remove("valid");
    length.classList.add("invalid");
  }
}

// Fetching card from API
const getCardInfo = async function() {
  const cardName = document.getElementById('cardSelectionInput').value;
  
  const response = await fetch('/fetchCard', {
    method: 'POST', 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      card_name: cardName
    })
  });
  
  const result = await response.json();

  // Checks if card name inserted is valid. If card not found, a message with an error will be informed. Otherwise displays the image and card text
  if (result.cardText === undefined) {
    document.getElementById('display-card-selected').innerText = result.cardSelected;
  } else {
    document.getElementById('card-image-result').setAttribute('src', result.cardImage);
    document.getElementById('display-card-selected').innerText = result.cardText;
  }

  console.log(result);
};
