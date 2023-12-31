import { checkUserStatus } from "./user.js";
let validationElement = document.querySelector(".validation");
let showProfile = document.querySelector(".show_profile");

const fetchUserProfile = async () => {
  const response = await fetch("/api/users/me");
  const data = await response.json();
  let name = document.querySelector(".showname");
  name.textContent = data.data.name;
  let school = document.querySelector(".showschool");
  school.textContent = data.data.school;
  let checkBtn = document.querySelector(".check-btn");
  checkBtn.style.display = "block";
};

function changeElementStatus(user_type) {
  if (user_type == 1) {
    validationElement.style.display = "flex";
    return;
  } else if (user_type == 2 || user_type == 3) {
    showProfile.style.display = "flex";
    fetchUserProfile();
  }
}
async function run() {
  let data = null;
  data = await checkUserStatus();
  if (data.ok && data.user_type) {
    changeElementStatus(data.user_type);
  }
}

run();
