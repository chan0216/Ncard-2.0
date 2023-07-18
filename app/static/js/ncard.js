import { checkUserStatus } from "./user.js";
let invite = document.querySelector(".invite");
let user_id;
let match_id;

async function checkMatchStatus() {
  let user_data = await checkUserStatus();
  if (!user_data) {
    window.location.href = "/login";
    return;
  }
  user_id = user_data.user_id;
  if (user_data.user_type == 1) {
    document.querySelector(".ncard__unverified").style.display = "flex";
    let unverified_btn = document.querySelector(".unverified_btn");
    unverified_btn.style.visibility = "visible";
    unverified_btn.textContent = "填寫基本資料";
    unverified_btn.setAttribute("href", "/verify");
  } else if (user_data.user_type == 2) {
    document.querySelector(".ncard__unverified").style.display = "flex";
    let unverified_btn = document.querySelector(".unverified_btn");
    unverified_btn.style.visibility = "visible";
    unverified_btn.textContent = "填寫自我介紹";
    unverified_btn.setAttribute("href", "/my/profile");
  } else if (user_data.user_type == 3 && user_data.match_today) {
    document.querySelector(".ncard__card").style.display = "none";
    document.querySelector(".ncard__unverified").style.display = "flex";
    let unverified_btn = document.querySelector(".unverified_btn");
    unverified_btn.style.visibility = "visible";
    unverified_btn.setAttribute("onclick", "return false;");
    unverified_btn.textContent = "午夜即可抽卡";
    unverified_btn.style.cursor = "default";
  } else if (user_data.user_type == 3 && user_data.match_tomorrow) {
    document.querySelector(".ncard__card").style.display = "none";
    document.querySelector(".ncard__unverified").style.display = "flex";
    let unverified_btn = document.querySelector(".unverified_btn");
    unverified_btn.style.visibility = "visible";
    unverified_btn.setAttribute("onclick", "return false;");
    unverified_btn.textContent = "隔天午夜即可抽卡";
    unverified_btn.style.cursor = "default";
  } else if (
    user_data.user_type == 3 &&
    !user_data.match_today &&
    !user_data.match_tomorrow
  ) {
    let ncardUnverified = document.querySelector(".ncard__unverified ");
    ncardUnverified.style.display = "none";
    let ncardCard = document.querySelector(".ncard__card");
    ncardCard.style.display = "block";
    getMatchProfile(user_data.user_id);
  }
}

//取得與該使用者今日配對的資料
const getMatchProfile = async (user_id) => {
  const result = await fetch(`/api/users/me/match`);
  const data = await result.json();
  if (data.data) {
    let info = data.data;
    match_id = info.user_id;
    if (!info.invited) {
      invite.style.backgroundColor = "#3397cf";
    } else if (info.is_friend) {
      invite.innerText = "已成為卡友";
      invite.disabled = true;
      invite.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    } else if (info["invited"]) {
      invite.innerText = "已送出好友邀請";
      invite.disabled = true;
      invite.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      invite.style.width = "144px";
      invite.style.opacity = "0.2";
    }
    let image = document.createElement("img");
    image.src = info.image;
    image.classList.add("image");
    document.querySelector(".imagediv").append(image);
    document.querySelector(".school").textContent = info.realname;
    document.querySelector(".interest").textContent = info.interest;
    document.querySelector(".club").textContent = info.club;
    document.querySelector(".course").textContent = info.course;
    document.querySelector(".country").textContent = info.country;
    document.querySelector(".worry").textContent = info.worry;
    document.querySelector(".exchange").textContent = info.exchange;
    document.querySelector(".trying").textContent = info.trying;

    if (info.gender == "F") {
      document.querySelector(".gender").textContent = "女同學";
    } else {
      document.querySelector(".gender").textContent = "男同學";
    }
  }
};

const addFriend = async () => {
  const requestData = {
    message: "雙方已成為好友，現在開始聊天吧",
    match_id: match_id,
  };
  const res = await fetch(`/api/users/me/invitation`, {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: { "content-type": "application/json" },
  });
  const data = await res.json();
  if (data.IsFriend) {
    let invite = document.querySelector(".invite");
    invite.innerText = "已成為卡友";
    invite.disabled = true;
    invite.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  } else {
    let invite = document.querySelector(".invite");
    invite.innerText = "已送出好友邀請";
    invite.disabled = true;
    invite.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    invite.style.width = "144px";
    invite.style.opacity = "0.2";
  }
};
document.querySelector("#invite").addEventListener("click", addFriend);
checkMatchStatus();
