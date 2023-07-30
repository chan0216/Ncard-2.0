import { checkUserStatus } from "./user.js";
import { refreshAccessToken } from "./user.js";
let LoadIcon = document.querySelector(".loading");
let url = new URL(window.location.href);
let date = new Date();
let comment = document.querySelector(".comment");
let now =
  ("0" + (date.getMonth() + 1)).slice(-2) +
  "/" +
  ("0" + date.getDate()).slice(-2) +
  " " +
  ("0" + date.getHours()).slice(-2) +
  ":" +
  ("0" + date.getMinutes()).slice(-2);
let likeElement = document.querySelector("#like_element");
let comment_count;
let postId = url.pathname.split("/")[2];
let postCard = document.querySelector(".post__card");
let commentContainer = document.querySelector(".comment__container");
let likeBar = document.querySelector(".like__bar");
let postComment = document.querySelector(".post__comment");
let main = document.querySelector("main");

//顯示文章
const getPost = async () => {
  commentContainer.style.display = "none";
  likeBar.style.display = "none";
  postComment.style.display = "none";
  const result = await fetch(`/api/${url.pathname}`);
  const data = await result.json();
  const post = data.data;
  if (data.error && result.status === 404) {
    let noPostDiv = document.createElement("div");
    noPostDiv.textContent = "沒有此篇文章！";
    postCard.append(noPostDiv);
  }
  if (post) {
    commentContainer.style.display = "block";
    likeBar.style.display = "flex";
    postComment.style.display = "flex";
    let schoolText = document.createElement("p");
    schoolText.textContent = post.school;
    let icon = document.createElement("i");
    icon.classList.add("bi-person-circle");
    document.querySelector(".originator").append(icon, schoolText);
    //看板
    const postBoard = document.createElement("a");
    postBoard.href = `/b/${post.eng_name}`;
    postBoard.innerHTML = post.board_name + " ·&nbsp;";
    postBoard.classList.add("post__board");
    //時間
    const postTime = document.createElement("p");
    postTime.textContent = post.time;
    postTime.classList.add("post__time");
    const boardTimeDiv = document.createElement("div");
    boardTimeDiv.append(postBoard, postTime);
    boardTimeDiv.style.display = "flex";
    //標題
    let titleDiv = document.createElement("div");
    titleDiv.textContent = post.title;
    titleDiv.classList.add("post_title");
    //文章
    let articleDiv = document.createElement("div");
    articleDiv.classList.add("post_content");
    articleDiv.innerHTML = post.content;
    postCard.append(titleDiv, boardTimeDiv, articleDiv);
    if (post["gender"] == "F") {
      icon.classList.add("women");
      document.querySelector(".women").style.display = "block";
    } else {
      icon.classList.add("man");
      document.querySelector(".man").style.display = "block";
    }
    //顯示讚數及留言數
    comment.textContent = post.comment_count;
    comment_count = post.comment_count;
    document.querySelector(".like").textContent = post.like_count;
    //顯示使用者有無對文章按愛心
    if (post.is_liked) {
      let like = document.querySelector(".bi-heart-fill");
      like.classList.add("active");
    }
  }
};

//文章按讚功能
async function likePost() {
  const res = await fetch(`/api${url.pathname}/like`, { method: "PATCH" });
  if (res.status === 401) {
    const success = await refreshAccessToken();
    if (success) {
      return await likePost();
    } else {
      window.location.href = "/login";
    }
  } else if (res.ok) {
    const data = await res.json();
    document.querySelector(".like").textContent = data.like_count;
    let like = document.querySelector(".bi-heart-fill");
    like.classList.toggle("active");
  }
}

let commentCard = document.querySelector(".comment_card");
let hasRenderedTitle = false;

//取得留言
let page = 0;
const renderMoreComment = async () => {
  const result = await fetch(
    `/api/posts/${url.pathname.split("/")[2]}/comments?page=${page}`
  );
  const data = await result.json();
  const res = data.data;
  page = data["next_page"];
  if (page == null) {
    observer.unobserve(LoadIcon);
    LoadIcon.style.display = "None";
  } else {
    LoadIcon.style.display = "flex";
  }
  //留言版標題
  if (!hasRenderedTitle) {
    let titleDiv = document.createElement("div");
    titleDiv.textContent = "留言";
    titleDiv.classList.add("title_div");
    commentCard.append(titleDiv);
    hasRenderedTitle = true;
  }
  if (res.length === 0) {
    let noCommentDiv = document.createElement("div");
    noCommentDiv.classList.add("no_comment_div");
    noCommentDiv.textContent = "有些話想說嗎\n快分享出來彼此交流吧！";
    noCommentDiv.style.whiteSpace = "pre-wrap";
    const btnDiv = document.createElement("div");
    btnDiv.classList.add("no_comment_btn");
    btnDiv.textContent = "留言搶頭香";
    noCommentDiv.append(btnDiv);
    commentCard.append(noCommentDiv);
    btnDiv.addEventListener("click", getUserCommentInfo);
  } else {
    for (const obj of res) {
      //留言div
      let commentDiv = document.createElement("div");
      commentDiv.classList.add("comment_div");
      //學校
      let icon = document.createElement("i");
      icon.classList.add("bi-person-circle");
      if (obj["gender"] == "F") {
        icon.classList.add("women");
        icon.style.display = "block";
      } else {
        icon.classList.add("man");
        icon.style.display = "block";
      }
      let school = document.createElement("p");
      school.textContent = obj["school"];
      school.classList.add("school");
      let text = document.createElement("p");
      text.innerHTML = obj["comment"];
      let createtime = document.createElement("p");
      createtime.textContent = obj["create_time"];
      let floor = document.createElement("p");
      floor.textContent = `B${obj["floor"]} ·`;
      floor.classList.add("floor");
      let timeAndFloor = document.createElement("div");
      timeAndFloor.style.display = "flex";
      timeAndFloor.append(floor, createtime);
      createtime.classList.add("createtime");
      let content = document.createElement("div");
      content.append(school, text, timeAndFloor);
      commentDiv.append(icon, content);
      commentCard.append(commentDiv);
    }
  }
};
// 加載更多留言
let options = { threshold: 0.5 };
let renderNextPages = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && page > 0) {
      renderMoreComment();
    }
  });
};
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(LoadIcon);

let commentBox = document.querySelector(".comment__box");
//上傳圖片
let lastClick = null;

commentBox.addEventListener("click", function (e) {
  lastClick = { x: e.clientX, y: e.clientY };
});

document.querySelector("#upload_img").addEventListener("change", function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    let imgData = e.target.result;
    let img = new Image();
    img.src = imgData;

    img.onload = function () {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      let compressedImage = canvas.toDataURL("image/jpeg", 0.7);

      let newImg = document.createElement("img");
      newImg.src = compressedImage;
      newImg.draggable = true;
      newImg.id = `draggableImage_${Date.now()}`;

      if (lastClick) {
        let element = document.elementFromPoint(lastClick.x, lastClick.y);
        element.appendChild(newImg);
      } else {
        commentBox.appendChild(newImg);
      }

      saveDraft();
    };
  };
  reader.readAsDataURL(file);
});

commentBox.ondragstart = function (event) {
  event.dataTransfer.setData("text", event.target.id);
};

commentBox.ondragover = function (event) {
  event.preventDefault();
};

commentBox.ondrop = function (event) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text");
  let text = document.getElementById(data);
  if (event.target.tagName == "img") {
    return;
  }
  event.target.appendChild(document.getElementById(data));
};

document.querySelector(".cancel").addEventListener("click", hideCommentStrip);

function showCommentStrip() {
  document.querySelector(".full__comment").style.display = "block";
}
function hideCommentStrip() {
  document.querySelector(".full__comment").style.display = "none";
}
const expandArrow = document.querySelector(".bi-arrows-angle-expand");
expandArrow.addEventListener("click", expandComment);

likeElement.addEventListener("click", () => likePost());
function expandComment() {
  document.querySelector(".full__comment").style.height = "95%";
  const commentBox = document.querySelector(".comment__box");
  commentBox.style.height = "inherit";
  const expandArrow = document.querySelector(".bi-arrows-angle-expand");
  if (expandArrow) {
    expandArrow.className = "bi-arrows-angle-contract";
    expandArrow.removeEventListener("click", expandComment);
    expandArrow.addEventListener("click", contractComment);
  }
}

function contractComment() {
  document.querySelector(".full__comment").style.height = "";
  const commentBox = document.querySelector(".comment__box");
  commentBox.style.height = "190px";
  const contractArrow = document.querySelector(".bi-arrows-angle-contract");
  if (contractArrow) {
    contractArrow.className = "bi-arrows-angle-expand";
    contractArrow.removeEventListener("click", contractComment);
    contractArrow.addEventListener("click", expandComment);
  }
}

//顯示留言者的資訊
const getUserCommentInfo = async () => {
  const result = await fetch(`/api/users/me`);
  const data = await result.json();
  if (data.error && result.status === 401) {
    const success = await refreshAccessToken();
    if (success) {
      await getUserCommentInfo();
    } else {
      window.location.href = "/login";
      return;
    }
  }
  const userData = data.data;
  if (userData.type == 1) {
    window.location.href = "/verify";
    return;
  }
  showCommentStrip();
  document.querySelector(".post__school").textContent = data.data.school;
  document.querySelector(".user__time").textContent = now;
  document.querySelector(".user__floor").textContent = `B${comment_count + 1}·`;

  const icon = document.querySelector(".user__gender .bi-person-circle");
  if (!icon) {
    const newIcon = document.createElement("i");
    newIcon.classList.add("bi-person-circle");
    newIcon.classList.add(data.data.gender === "F" ? "women" : "man");
    newIcon.style.display = "block";
    document.querySelector(".user__gender").appendChild(newIcon);
  }
};
document
  .querySelector(".post__comment")
  .addEventListener("click", getUserCommentInfo);
// 監聽留言內容的變化事件
commentBox.addEventListener("input", saveDraft);

// 處理草稿保存
function saveDraft() {
  let key = `draft_${postId}`;
  localStorage.setItem(key, commentBox.innerHTML);
}

function loadDraft() {
  let key = `draft_${postId}`;
  const commentDraft = localStorage.getItem(key);

  if (commentDraft) {
    commentBox.innerHTML = commentDraft;
  }
}
//新增留言
const addComment = async () => {
  let commentText = commentBox.innerHTML;
  if (commentText === "") {
    return false;
  }
  let { imgData, commentContent } = processImages();
  if (imgData.length === 0) {
    imgData = [];
    commentContent = commentText;
  }
  let cleanContent = DOMPurify.sanitize(commentContent, {
    ALLOWED_TAGS: ["div", "img", "br"],
  });
  const comment = {
    content: cleanContent,
    images: imgData,
  };
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comment),
  };
  const result = await fetch(`/api/posts/${postId}/comments`, config);
  const data = await result.json();
  const commentData = data.data;
  if (result.status === 401) {
    const success = await refreshAccessToken();
    if (success) {
      return await addComment();
    } else {
      window.location.href = "/login";
    }
  }
  if (data.data) {
    let commentCard = document.querySelector(".comment_card");
    commentCard.style.background = "rgb(245, 245, 245)";
    let commentDiv = document.createElement("div");
    commentDiv.classList.add("comment_div");
    let comContainer = document.querySelector(".comment__container");
    comContainer.append(commentCard);
    //學校
    let icon = document.createElement("i");
    icon.classList.add("bi-person-circle");
    if (commentData.gender == "F") {
      icon.classList.add("women");
      icon.style.display = "block";
    } else {
      icon.classList.add("man");
      icon.style.display = "block";
    }
    let school = document.createElement("p");
    school.textContent = commentData.school;
    school.classList.add("school");
    let text = document.createElement("p");
    text.innerHTML = commentData.comment;
    let createtime = document.createElement("p");
    createtime.textContent = commentData.create_time;
    createtime.classList.add("createtime");
    let timeAndFloor = document.createElement("div");
    timeAndFloor.style.display = "flex";
    let floor = document.createElement("p");
    floor.textContent = `B${commentData.floor} ·`;
    floor.classList.add("floor");
    timeAndFloor.append(floor, createtime);
    let content = document.createElement("div");
    content.append(school, text, timeAndFloor);
    commentDiv.append(icon, content);
    commentCard.append(commentDiv);
    hideCommentStrip();
    let noCommentDiv = document.querySelector(".no_comment_div");
    if (noCommentDiv) {
      noCommentDiv.style.display = "none";
    }
    //下滑到留言
    commentCard.scrollIntoView({ behavior: "smooth", block: "end" });
    //清除欄位value
    commentBox.textContent = "";
    //清除草稿
    const key = `draft_${postId}`;
    localStorage.removeItem(key);
  }
};

//處理留言裡的圖片
function processImages() {
  let images = document.querySelectorAll(".comment__box img");
  let commentContent = commentBox.innerHTML;
  let imgData = [];

  for (let i = 0; i < images.length; i++) {
    let img = images[i];
    let dataUrl = img.src;
    imgData.push(dataUrl);
    commentContent = commentContent
      .replaceAll(img.src, `{imgSrc${i}}`)
      .replaceAll('draggable="true"', "")
      .replaceAll(`id="${img.id}"`, "");
  }
  return { imgData, commentContent };
}

document.querySelector(".submit").addEventListener("click", addComment);

commentBox.addEventListener("paste", handlePaste);

function handlePaste(event) {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, text);
}

commentBox.addEventListener("input", () => {
  scrollToBottom(commentBox);
});

// commentBox.addEventListener("keydown", (event) => {
//   if (event.key === "Enter") {
//     scrollToBottom(commentBox);
//   }
// });

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("click", (event) => {
    event.target.classList.toggle("selected");
  });
});

async function run() {
  await checkUserStatus();
  main.style.display = "block";
  await getPost();
  await renderMoreComment();
  loadDraft();
}

run();
