import { refreshAccessToken, checkUserStatus } from "./user.js";
let postContent = document.querySelector(".newpost__content");
let postTitle = document.querySelector(".newpost__title");
let mainElement = document.querySelector("main");
let warning = document.querySelector(".warning");
let boardSelect = document.querySelector("#boardSelect");
let showBoard = document.querySelector(".showboard");
let lastClick = null;
let isBoardVisible = false;
let selectedBoard = document.querySelector("#selectedBoard");
let options = document.querySelectorAll(".option");

boardSelect.addEventListener("click", function (e) {
  if (isBoardVisible) {
    showBoard.style.display = "none";
  } else {
    showBoard.style.display = "block";
  }
  isBoardVisible = !isBoardVisible;
});

document.addEventListener("click", function (event) {
  if (event.target !== boardSelect && !showBoard.contains(event.target)) {
    showBoard.style.display = "none";
    isBoardVisible = false;
  }
});

options.forEach((option) => {
  option.addEventListener("click", function () {
    let selectedValue = this.getAttribute("data-value");
    let selectedText = this.textContent;
    localStorage.setItem("selectedBoardValue", selectedValue);
    localStorage.setItem("selectedBoardText", selectedText);
    selectedBoard.textContent = selectedText;
    selectedBoard.value = selectedValue;
    showBoard.style.display = "none";
    isBoardVisible = false;
  });
});

//上傳照片
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
        postContent.appendChild(newImg);
      }
      saveDraft();
    };
  };
  reader.readAsDataURL(file);
});

postContent.ondragover = function (event) {
  event.preventDefault();
};

postContent.ondragstart = function (event) {
  event.dataTransfer.setData("text", event.target.id);
};

postContent.ondrop = function (event) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text");
  let draggedImage = document.getElementById(data);
  let targetImage = event.target;
  if (targetImage.tagName === "IMG") {
    let parentElement = targetImage.parentElement;
    parentElement.insertBefore(draggedImage, targetImage);
  } else {
    event.target.appendChild(draggedImage);
  }
  saveDraft();
};

//發新文章
document.querySelector(".submit").addEventListener("click", addNewPost);
async function addNewPost() {
  try {
    if (
      postContent.innerHTML == "" ||
      postTitle.value == "" ||
      selectedBoard.value == ""
    ) {
      warning.textContent = "請輸入完整";
      return;
    }
    warning.textContent = "上傳中...";
    warning.style.color = "#fd7e14";
    let { imgData, processContent } = processImages();
    if (imgData.length === 0) {
      imgData = [];
      processContent = postContent.innerHTML;
    }
    let cleanContent = DOMPurify.sanitize(processContent, {
      ALLOWED_TAGS: ["div", "img", "br"],
    });
    const newPost = {
      title: postTitle.value,
      content: cleanContent,
      images: imgData,
      board: selectedBoard.value,
    };
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPost),
    };
    const res = await fetch("/api/posts", config);
    const data = await res.json();
    const post_id = data.data;
    if (res.status === 401) {
      const success = await refreshAccessToken();
      if (success) {
        await addNewPost();
      } else {
        window.location.href = "/login";
      }
    }
    if (!res.ok) {
      throw new Error();
    }
    if (post_id) {
      localStorage.removeItem("articleContentDraft");
      localStorage.removeItem("articleTitleDraft");
      localStorage.removeItem("selectedBoardText");
      localStorage.removeItem("selectedBoardValue");
      window.location.href = `/posts/${post_id}`;
    }
  } catch (error) {
    warning.textContent = "上傳失敗，請稍後再試";
    warning.style.color = "#ff0000";
  }
}

//處理文章裡的圖片
function processImages() {
  let images = document.querySelectorAll(".newpost__content img");
  let processContent = postContent.innerHTML;
  let imgData = [];

  for (let i = 0; i < images.length; i++) {
    let img = images[i];
    let dataUrl = img.src;
    imgData.push(dataUrl);
    processContent = processContent
      .replaceAll(img.src, `{imgSrc${i}}`)
      .replaceAll('draggable="true"', "")
      .replaceAll(`id="${img.id}"`, "");
  }
  return { imgData, processContent };
}

//若文章或標題有變化就存草稿
postContent.addEventListener("input", saveDraft);
postTitle.addEventListener("input", saveDraft);

//使用 localStorage 將文章內容和標題存起來
function saveDraft() {
  localStorage.setItem("articleContentDraft", postContent.innerHTML);
  localStorage.setItem("articleTitleDraft", postTitle.value);
}

//處理使用者貼上的文字
postContent.addEventListener("paste", handlePaste);
function handlePaste(event) {
  event.preventDefault();
  let text = event.clipboardData.getData("text/plain");
  text = text.replace(/\n/g, "<br>");
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  range.deleteContents();
  let div = document.createElement("div");
  div.innerHTML = text;
  range.insertNode(div);
  saveDraft();
}

postContent.addEventListener("input", () => {
  scrollToBottom(postContent);
});

postContent.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    scrollToBottom(postContent);
  }
});

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

//加載草稿
function loadDraft() {
  let selectedValue = localStorage.getItem("selectedBoardValue");
  let selectedText = localStorage.getItem("selectedBoardText");
  let articleContentDraft = localStorage.getItem("articleContentDraft");
  let articleTitleDraft = localStorage.getItem("articleTitleDraft");
  if (selectedValue && selectedText) {
    selectedBoard.textContent = selectedText;
    selectedBoard.value = selectedValue;
  }
  if (articleContentDraft) {
    postContent.innerHTML = articleContentDraft;
  }
  if (articleTitleDraft) {
    postTitle.value = articleTitleDraft;
  }
}

async function loadPage() {
  let userData = await checkUserStatus();
  if (!userData) {
    window.location.href = "/login";
    return;
  }
  let userType = userData["user_type"];
  if (userType == 1) {
    window.location.href = "/verify";
    return;
  }
  loadDraft();
  mainElement.style.display = "block";
}

loadPage();
