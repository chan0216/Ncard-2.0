import { checkUserStatus } from "./user.js";
import { renderPage } from "./utils.js";
let url = window.location.href;
let parts = url.split("/");
let board = parts[parts.length - 1];
let page = 0;
let newTitle = document.querySelector("#newTitle");
let hotTitle = document.querySelector("#hotTitle");
let LoadIcon = document.querySelector(".bi-arrow-clockwise");
let indexArticles = document.querySelector(".index__articles");

const getPosts = async (type) => {
  const result = await fetch(
    `/api/posts?page=${page}&type=${type}&board=${board}`
  );
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
    LoadIcon.style.display = "None";
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
  getPosts("new");
}

run();
