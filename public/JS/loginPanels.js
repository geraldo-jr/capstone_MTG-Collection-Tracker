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
    let floaringBox = btn.closest(".signup-box");
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
  if (event.target.className === "signup-box") {
    event.target.style.display = "none";
  }
};
