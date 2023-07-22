export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

export function renderPage(res, indexArticles) {
  for (const obj of res) {
    //發文人學校
    let userschool = document.createElement("p");
    userschool.classList.add("userschool");
    userschool.textContent = obj["school"];
    let contentDiv = document.createElement("div");
    contentDiv.classList.add("content_div");
    let icon = document.createElement("i");
    icon.classList.add("bi-person-circle");
    let icondiv = document.createElement("div");
    icondiv.classList.add("icondiv");
    icondiv.append(icon, userschool);
    let articleDiv = document.createElement("div");

    //標題
    let title = document.createElement("p");
    title.classList.add("articles__title");
    title.textContent = obj["title"];
    //文章內容
    let content = document.createElement("p");
    let textDiv = document.createElement("div");
    textDiv.classList.add("text_div");
    const plainTextContent = getPlainText(obj["content"]);
    textDiv.textContent = plainTextContent;
    //呈現讚數及留言數
    let likeIcon = document.createElement("i");
    likeIcon.classList.add("bi-suit-heart");
    let commentIcon = document.createElement("i");
    commentIcon.classList.add("bi-chat-dots");

    let likeContainer = document.createElement("div");
    likeContainer.classList.add("like__container");
    let likeNums = document.createElement("p");
    likeNums.textContent = obj["like_count"];
    let commentNums = document.createElement("p");
    commentNums.textContent = obj["comment_count"];
    likeContainer.append(likeIcon, likeNums, commentIcon, commentNums);
    //呈現第一張圖片
    if (obj["first_img"]) {
      let imageDiv = document.createElement("div");
      let image = document.createElement("img");
      image.src = obj["first_img"];
      image.classList.add("first_img");
      imageDiv.classList.add("image_div");
      imageDiv.append(image);
      articleDiv.append(icondiv, title, textDiv, likeContainer);
      contentDiv.append(articleDiv, imageDiv);
    } else {
      articleDiv.append(icondiv, title, textDiv, likeContainer);
      contentDiv.append(articleDiv);
    }
    indexArticles.append(contentDiv);
    contentDiv.setAttribute("id", obj.id);
    contentDiv.addEventListener("click", () => selectid(contentDiv.id));
    if (obj["gender"] == "F") {
      icon.classList.add("women");
    } else {
      icon.classList.add("man");
    }
  }
}

function selectid(checkid) {
  window.location.href = `/posts/${checkid}`;
}

function getPlainText(html) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;
  tempElement.innerHTML = tempElement.innerHTML.replace(/<div>/g, "\n");
  tempElement.innerHTML = tempElement.innerHTML.replace(/<\/div>/g, "");
  return tempElement.textContent || "";
}
