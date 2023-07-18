import { checkUserStatus } from "./user.js";
const ncardCard = document.querySelector(".ncard__card");
const submitBtn = document.querySelector(".submit");
const proWarning = document.querySelector(".profile__warning");
let mainElement = document.querySelector("main");

document.querySelector(".ncardintro").classList.add("active");

//取得使用者資料
const getMatchProfile = async () => {
  const result = await fetch(`/api/users/me`);
  const data = await result.json();
  const res = data.data;
  if (res) {
    let image = document.createElement("img");
    if (res.image) {
      image.src = res.image;
      image.classList.add("image");
      image.setAttribute("id", "ncardimage");
      document.querySelector(".imagediv").append(image);
      document.querySelector(".realname").textContent = res.name;
      document.querySelector(".school").textContent = res.school;
      document.querySelector(".interest").value = res.interest;
      document.querySelector(".club").value = res.club;
      document.querySelector(".course").value = res.course;
      document.querySelector(".country").value = res.country;
      document.querySelector(".worry").value = res.worry;
      document.querySelector(".exchange").value = res.exchange;
      document.querySelector(".trying").value = res.trying;
    } else {
      let welTitle = document.querySelector(".wel_title");
      welTitle.textContent = "只要回答三個問題，並新增照片就可以開啟抽卡功能";
    }
  }
};

const checkStatus = async () => {
  let userData = await checkUserStatus();
  if (!userData) {
    window.location.href = "/login";
    return;
  }
  mainElement.style.display = "block";
  let userType = userData["user_type"];
  if (userType == 1) {
    let noprofile = document.querySelector(".noprofile");
    noprofile.style.display = "block";
  } else if (userType == 2 || userType == 3) {
    ncardCard.style.display = "block";
    getMatchProfile();
  }
};

document.querySelector("#upload_img").addEventListener("change", (event) => {
  let file = event.target.files[0];

  let reader = new FileReader();
  reader.onload = function (e) {
    let img = document.createElement("img");
    img.src = e.target.result;
    img.setAttribute("id", "ncardimage");
    img.classList.add("image");
    let imagediv = document.querySelector(".imagediv");
    imagediv.innerHTML = "";
    imagediv.appendChild(img);
  };
  reader.readAsDataURL(file);
});

//填寫自我介紹
const postMatchProfile = async () => {
  let user_data = await checkUserStatus();
  if (!user_data) {
    proWarning.textContent = "填寫失敗，請重新登入";
  }
  const image = document.querySelector("#ncardimage");
  if (image == null) {
    proWarning.textContent = "請新增照片";
    return;
  }
  let interest = document.querySelector(".interest").value;
  let club = document.querySelector(".club").value;
  let course = document.querySelector(".course").value;
  let country = document.querySelector(".country").value;
  let worry = document.querySelector(".worry").value;
  let exchange = document.querySelector(".exchange").value;
  let trying = document.querySelector(".trying").value;
  let NcardArr = [interest, club, course, country, worry, exchange, trying];
  if (NcardArr.filter((q) => !q).length > 4) {
    proWarning.textContent = "請至少回答三個問題";
    proWarning.style.color = "#FFA500";
    return;
  }
  proWarning.textContent = "上傳中...";
  proWarning.style.color = "#fd7e14";
  const postNcard = {
    update_type: "match_info",
    image: image.src,
    interest: interest,
    club: club,
    course: course,
    country: country,
    worry: worry,
    exchange: exchange,
    trying: trying,
  };
  const config = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postNcard),
  };
  const result = await fetch(`/api/users/me`, config);
  const data = await result.json();
  const res = data;
  if (res.ok) {
    proWarning.style.color = "#228b22";
    proWarning.textContent = "新增成功";
  } else {
    proWarning.style.color = "#FFA500";
    proWarning.textContent = "新增失敗，請稍後再試";
  }
};

submitBtn.addEventListener("click", () => {
  postMatchProfile();
});

checkStatus();
