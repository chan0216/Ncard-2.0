const friend_id = location.pathname.split("/").pop();
import { checkUserStatus } from "./user.js";

async function fetchFriend() {
  const response = await fetch(`/api/users/${friend_id}`);
  const data = await response.json();
  let ncard = document.querySelector(".ncard__card");
  ncard.style.display = "block";
  if (data.data) {
    let info = data.data;
    document.querySelector(".invite").style.backgroundColor = "#3397cf";
    let image = document.createElement("img");
    image.src = info.image;
    image.classList.add("image");
    document.querySelector(".imagediv").append(image);
    document.querySelector(".realname").textContent = info.name;
    document.querySelector(".school").textContent = info.school;
    document.querySelector(".interest").textContent = info.interest;
    document.querySelector(".club").textContent = info.club;
    document.querySelector(".course").textContent = info.course;
    document.querySelector(".country").textContent = info.country;
    document.querySelector(".worry").textContent = info.worry;
    document.querySelector(".exchange").textContent = info.exchange;
    document.querySelector(".trying").textContent = info.trying;
    document
      .querySelector(".invite")
      .setAttribute("onclick", `location.href='/chats/${info.roomId}'`);
  }
}
async function run() {
  let loginStatus = await checkUserStatus();
  if (!loginStatus) {
    window.location.href = "/login";
    return;
  }
  fetchFriend();
}

run();
