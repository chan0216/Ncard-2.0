import { checkUserStatus } from "./user.js";
const loginForm = document.querySelector("#loginForm");
const errorText = document.querySelector(".error__text");
loginForm.addEventListener("submit", signIn);

async function signIn(e) {
  e.preventDefault();
  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (pattern.test(email) === false) {
    errorText.textContent = "電子郵件不符合格式";
    return false;
  }
  if (password == "") {
    errorText.textContent = "密碼不得為空";
    return false;
  }
  errorText.textContent = "登入中...";
  errorText.style.color = "#006400";
  const signinData = {
    identifier: email,
    password: password,
    login_type: "ncard",
  };
  const response = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(signinData),

    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (data.ok) {
    window.location.replace("/");
  } else {
    errorText.textContent = data.message;
    errorText.style.color = "rgb(232, 82, 82)";
  }
}

export async function handleCredentialResponse(response) {
  const result = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: response.credential,
      password: null,
      login_type: "Google",
    }),
  });
  const data = await result.json();
  if (data.ok) {
    window.location.replace("/");
  }
}

checkUserStatus();
