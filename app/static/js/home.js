import { checkUserStatus } from "./user.js";
import { renderPage } from "./utils.js";
let newTitle = document.querySelector("#newTitle");
let hotTitle = document.querySelector("#hotTitle");
let LoadIcon = document.querySelector(".bi-arrow-clockwise");
let indexArticles = document.querySelector(".index__articles");

//取得最新文章
let page = 0;
const getNewPosts = async () => {
  const result = await fetch(`/api/posts?page=${page}&type=new`);
  const data = await result.json();
  const res = data.data;
  hotTitle.classList.remove("active");
  newTitle.classList.add("active");
  page = data["nextPage"];
  if (page == null) {
    observer.unobserve(LoadIcon);
    LoadIcon.style.display = "None";
  }
  renderPage(res, indexArticles);
};
let options = { threshold: 0.5 };
let renderNextPages = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (currentFunction === "new") {
        getNewPosts();
      } else if (currentFunction === "hot") {
        getHotPosts();
      }
    }
  });
};
let currentFunction = "new";
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(LoadIcon);

//取得熱門文章
const getHotPosts = async () => {
  const result = await fetch(`/api/posts?page=${page}&type=hot`);
  const data = await result.json();
  const res = data.data;
  hotTitle.classList.add("active");
  newTitle.classList.remove("active");
  page = data["nextPage"];
  if (page == null) {
    observer.unobserve(LoadIcon);
    LoadIcon.style.display = "None";
  }
  renderPage(res, indexArticles);
};

const switchCategory = (category) => {
  observer.unobserve(LoadIcon);
  indexArticles.innerHTML = "";
  page = 0;
  LoadIcon.style.display = "flex";

  if (category === "new") {
    currentFunction = "new";
    observer.observe(LoadIcon);
  } else if (category === "hot") {
    currentFunction = "hot";
    observer.observe(LoadIcon);
  }
};
hotTitle.addEventListener("click", () => switchCategory("hot"));
newTitle.addEventListener("click", () => switchCategory("new"));

async function run() {
  await checkUserStatus();
}

run();
