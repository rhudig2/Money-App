document.addEventListener("DOMContentLoaded", () => {
  const signinlink = document.getElementById("signin_link");
  const registerlink = document.getElementById("register_link");
  const loginForm = document.getElementById("Login_form");
  const registerForm = document.getElementById("register_form");

  signinlink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    registerForm.reset();
  });
  registerlink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    loginForm.reset();
  });
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const validForm = registrationFormValidation(registerForm);
    console.log(validForm)
    if(!validForm){
        return;
    }

    const user =  createUser(registerForm)
    storeUser(user)
    const success = document.querySelector(".success");
    success.style.display = "flex"
    registerForm.reset()
    setTimeout(function() {
        window.location.reload();
      }, 3000); // 3000 milliseconds = 3 seconds
      

  });
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = loginForm.login_password.value;
    const email = loginForm.login_email.value;
    loginValidation(email, password);

  });

  listenForPasswordValidation("register_password", "error-alert");
});

function emailValidation(email){
    if (!validateEmail(email)){
        alert("Invalid email")
        return false;
    }
    const users = JSON.parse(localStorage.getItem("users"));
    if (users){
        let EmailinUse = false;
        users.forEach((user) => {
            if (user.email === email){
                EmailinUse = true;
            };
        })

        if(EmailinUse){
            alert("Email already exists")
            return false;
        }
    }
    


    return true;
}
function registrationFormValidation (form){
    const firstname = form.register_firstname.value;
    const lastname = form.register_lastname.value;
    const email = form.register_email.value;
    const password = form.register_password.value;
    const confirm_password = form.register_confirm_password.value;
    if (!emailValidation(email)){
        return false
    };
    if(!validatePassword){
        return false;
    };

    if (
      firstname === "" ||
      lastname === "" ||
      email === "" ||
      password === "" ||
      confirm_password === ""
    ) {
      alert("Please complete all fields");
      return false;
    }
    if (password !== confirm_password){
        alert("passwords do not match");
        return false;
    }
    return true;
    
}
function createUser(form){
    const user = {
        firstname : form.register_firstname.value,
        lastname : form.register_lastname.value,
        email : form.register_email.value,
        password : form.register_password.value
    };
    return user;
}
function storeUser(user){
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}
function validateEmail(email) {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check if the email matches the regex pattern
    if (emailRegex.test(email)) {
      return true; // Email is valid
    } else {
      return false; // Email is invalid
    }
  }

  function validatePassword(password){
    if (password.length < 8) return false;

    const upperCaseRegex = /[A-Z]/;
    const lowerCaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;

    if (!upperCaseRegex.test(password) || !lowerCaseRegex.test(password) || !digitRegex.test(password)){
        return false;
    }
    return true;
  }
  function listenForPasswordValidation(passwordInputId, errorContainerClass) {
    // Get the error message container
    const errorContainer = document.querySelector(`.${errorContainerClass}`);
    const confirmError = document.querySelector(".pas-warn");
  
    // Listen to the password input event
    const passwordInput = document.getElementById(passwordInputId);
    const confirmInput = document.getElementById("register_confirm_password");
    passwordInput.addEventListener('input', function() {
      const password = passwordInput.value;
      const isValidPassword = validatePassword(password);
  
      // Update the visibility of the error message based on password validity
      if (isValidPassword || password === "") {
        errorContainer.style.display = 'none';
      } else {
        errorContainer.style.display = 'block';
      }

    });
    confirmInput.addEventListener("input", () => {
        const confirmPassword = confirmInput.value;
        if (confirmPassword === passwordInput.value || confirmPassword === ""){
            confirmError.style.display  = "none";
        }else{
            confirmError.style.display = "block";
        }
    })
  }

  function loginValidation(email, password){
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const authenticUser = users.find((user) => user.email === email && user.password === password);

    if(authenticUser){
        localStorage.setItem("authenticated", "true")
        document.querySelector(".success_login").style.display = "flex";
        setTimeout(() => {
            window.location.href = "Dashboard.html"
        }, 3000);
    }else{
        document.querySelector(".failure").style.display = "flex";
    }
  }
  function closeError(){
    document.querySelector(".failure").style.display = "none";
  }