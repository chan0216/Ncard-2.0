import { checkUserStatus } from "./user.js";
import { renderPage } from "./utils.js";
let load = document.querySelector(".bi-arrow-clockwise");
let posts = document.querySelector(".posts");
let NoLikeElement = document.querySelector(".no-liked-posts");
let mainElement = document.querySelector("main");
let page = 0;

document.querySelector(".ncardlike").classList.add("active");

const getLikePost = async () => {
  const result = await fetch(`/api/users/me/liked_posts?page=${page}`);
  const data = await result.json();
  const res = data.data;
  if (res.length == 0) {
    load.style.display = "None";
    NoLikeElement.style.display = "flex";
    return;
  }
  page = data["nextPage"];
  console.log(page);
  if (page == null) {
    observer.unobserve(load);
    load.style.display = "none";
  } else {
    load.style.display = "flex";
  }
  renderPage(res, posts);
};
let options = { threshold: 0.5 };
let renderNextPages = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && page > 0) {
      getLikePost();
    }
  });
};
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(load);

async function run() {
  let loginStatus = await checkUserStatus();
  if (!loginStatus) {
    window.location.href = "/login";
    return;
  } else {
    mainElement.style.display = "block";
    getLikePost();
  }
}

run();
