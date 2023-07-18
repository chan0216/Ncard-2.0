const navStranger = document.querySelector(".nav-stranger");
const navUser = document.querySelector(".nav-user");
const logoutBtn = document.querySelector("#logout-btn");
logoutBtn.addEventListener("click", deleteUser);

//登出
async function deleteUser() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  const data = await response.json();
  if (data.ok) {
    localStorage.clear();
    location.reload();
  }
}
//確認使用者的登入狀態
export async function checkUserStatus() {
  const response = await fetch("/api/auth/status");
  const data = await response.json();

  if (response.status === 401) {
    const success = await refreshAccessToken();
    if (success) {
      return checkUserStatus();
    } else {
      navStranger.style.display = "block";
      navUser.style.display = "none";
      return false;
    }
  } else if (response.ok) {
    navStranger.style.display = "none";
    navUser.style.visibility = "visible";
    return data;
  } else {
    navStranger.style.display = "block";
    navUser.style.display = "none";
    return false;
  }
}

//換token
export async function refreshAccessToken() {
  const refreshToken = getCookie("refresh_token");
  if (refreshToken) {
    const response = await fetch("/api/auth/token", {
      method: "PUT",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
