// Enable or close signup and login floating boxes
let boxAnchor = [...document.querySelectorAll(".openBox")];
boxAnchor.forEach(function (btn) {
  btn.onclick = function () {
    let box = btn.getAttribute("origin");

    if (box === "login") {
      document.getElementById("login").style.display = "block";
    } else if (box === "signup") {
      document.getElementById("signup").style.display = "block";
    }
  }
});

// Close floating boxes
let closeBtn = [...document.querySelectorAll(".close")];
closeBtn.forEach(function (btn) {
  btn.onclick = function() {
    let floaringBox = btn.closest(".popup-box");
    let floaringSelectCardBox = btn.closest("#display-card-options");
    if (floaringSelectCardBox === null) {
      floaringBox.style.display = "none";
    } else {
      floaringSelectCardBox.style.display = "none";
    }
  }
});

// Closes modal when clicked outside the box
window.onclick = function (event) {
  if (event.target.className === "popup-box") {
    event.target.style.display = "none";
  }
};

// Shows and close alert box for messages
function alertBox(message) {
  let modalBox = document.getElementById("alert-popup");
  let pInModalBox = document.querySelector("#alert-message");
  
  if (message !== undefined) {
    pInModalBox.innerText = message;
    modalBox.style.display = "block";
  } else {
    modalBox.style.display = "none";
  }
}