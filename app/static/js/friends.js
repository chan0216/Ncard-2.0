import { checkUserStatus } from "./user.js";
let mainElement = document.querySelector("main");
let LoadIcon = document.querySelector(".bi-arrow-clockwise");
let page = 0;

document.querySelector(".ncardfriend").classList.add("active");

async function fetchFriendsData() {
  const response = await fetch(`/api/users/me/friends?page=${page}`);
  const data = await response.json();

  page = data["next_page"];
  if (page == null) {
    observer.unobserve(LoadIcon);
    LoadIcon.style.display = "none";
  } else {
    LoadIcon.style.display = "flex";
  }
  if (data.data && data.data.length > 0) {
    let infoArr = data.data;
    for (let info of infoArr) {
      let friendList = document.querySelector(".friend__list");
      let friendimgDiv = document.createElement("div");
      let friendImg = document.createElement("img");
      let friendDiv = document.createElement("div");
      let friendDataDiv = document.createElement("div");
      let friendName = document.createElement("p");
      let friendSchool = document.createElement("p");
      friendName.textContent = info.name;
      friendSchool.textContent = info.school;
      friendImg.src = info.image;
      friendImg.classList.add("friend_img");
      friendimgDiv.classList.add("friendimg_div");
      friendDataDiv.classList.add("frienddata_div");
      friendDiv.classList.add("friendDiv");
      friendimgDiv.append(friendImg);
      friendDataDiv.append(friendName, friendSchool);
      friendDiv.append(friendimgDiv, friendDataDiv);
      friendDiv.setAttribute(
        "onclick",
        `location.href='/friend/${info.user_id}'`
      );
      friendList.append(friendDiv);
    }
  } else {
    document.querySelector(".nofriend").style.display = "flex";
    LoadIcon.style.display = "none";
  }
}

let options = { threshold: 0.5 };
let renderNextPages = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && page > 0) {
      fetchFriendsData();
    }
  });
};
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(LoadIcon);

async function run() {
  let loginStatus = await checkUserStatus();
  if (!loginStatus) {
    mainElement.style.display = "block";
    window.location.href = "/login";
  }
  await fetchFriendsData();
}

run();
