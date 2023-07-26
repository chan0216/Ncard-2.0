import { checkUserStatus } from "./user.js";
import { renderPage } from "./utils.js";
let apiUrl;
let page = 0;
let url = window.location.href;
let parts = url.split("/");
let board = parts[parts.length - 1];
let newTitle = document.querySelector("#newTitle");
let hotTitle = document.querySelector("#hotTitle");
let LoadIcon = document.querySelector(".loading");
let indexArticles = document.querySelector(".index__articles");
let boardLinks = document.querySelectorAll(".board");

boardLinks.forEach((link) => {
  let href = link.getAttribute("href");
  let board_name = href.split("/")[2];
  if (board === board_name) {
    let divInsideLink = link.querySelector("div");
    divInsideLink.classList.add("active");
  }
});

const checkApiUrl = (type) => {
  if (board) {
    apiUrl = `/api/posts?page=${page}&type=${type}&board=${board}`;
  } else {
    apiUrl = `/api/posts?page=${page}&type=${type}`;
  }
  return apiUrl;
};

const getPosts = async (type) => {
  apiUrl = checkApiUrl(type);
  const result = await fetch(apiUrl);
  const data = await result.json();
  const res = data.data;
  if (type === "new") {
    newTitle.classList.add("active");
    hotTitle.classList.remove("active");
  } else if (type === "hot") {
    hotTitle.classList.add("active");
    newTitle.classList.remove("active");
  }
  page = data["nextPage"];
  if (page == null) {
    observer.unobserve(LoadIcon);
    LoadIcon.style.display = "none";
  } else {
    LoadIcon.style.display = "flex";
  }
  renderPage(res, indexArticles);
};

let options = { threshold: 0.5 };
const renderNextPages = (entries) => {
  const funcMap = {
    new: getPosts,
    hot: getPosts,
  };

  entries.forEach((entry) => {
    console.log(page);
    if (entry.isIntersecting && page > 0) {
      funcMap[currentFunction](currentFunction);
    }
  });
};

let currentFunction = "new";
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(LoadIcon);

const switchCategory = async (category) => {
  observer.unobserve(LoadIcon);
  indexArticles.innerHTML = "";
  page = 0;
  LoadIcon.style.display = "none";
  currentFunction = category;
  await getPosts(currentFunction);
  observer.observe(LoadIcon);
};

hotTitle.addEventListener("click", () => switchCategory("hot"));
newTitle.addEventListener("click", () => switchCategory("new"));

async function run() {
  await checkUserStatus();
  await getPosts(currentFunction);
}

run();
