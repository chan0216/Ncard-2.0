import { checkUserStatus } from "./user.js";
let page = 0;
let LoadIcon = document.querySelector(".loader");
const fullContent = document.querySelector(".full__content");
const socket = io();
let friendsIdList = null;

document.querySelector(".send__message").addEventListener("click", showChatBox);
function showChatBox() {
  fullContent.style.display = "block";
}

document.querySelector(".cancel").addEventListener("click", hideChatBox);
function hideChatBox() {
  fullContent.style.display = "none";
}

socket.on("connect", () => {
  joinRoom();
});

async function joinRoom() {
  let user_data = await checkUserStatus();
  if (!user_data) {
    window.location.href = "/login";
    return;
  }
  friendsIdList.forEach((roomId) => {
    socket.emit("join_room", roomId.toString());
  });
}

let options = { threshold: 0.5 };
let renderNextPages = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && page > 0) {
      fetchMsg();
    }
  });
};
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(LoadIcon);

//顯示聊天列表
async function fetchMsg() {
  const response = await fetch(`/api/users/me/chatrooms?page=${page}`);
  const data = await response.json();
  let res = data.data;
  friendsIdList = res.friends_id_list;
  let messages_list = res.messages_list;
  page = res["next_page"];
  if (page == null) {
    observer.unobserve(LoadIcon);
    LoadIcon.style.display = "none";
  } else {
    LoadIcon.style.display = "flex";
  }
  messages_list.forEach((friend) => {
    renderFriends(friend);
  });
}
function renderFriends(friend) {
  const friendList = document.querySelector(".friend__list");
  const msgDiv = document.createElement("div");
  //顯示朋友名字
  const friendName = document.createElement("h6");
  friendName.textContent = friend.name;
  friendName.classList.add("friend__name");
  //顯示最新訊息
  const friendMsg = document.createElement("p");
  friendMsg.textContent = friend.message;
  friendMsg.classList.add("friend__msg");
  msgDiv.classList.add("msg__div");
  msgDiv.append(friendName, friendMsg);
  //顯示頭像
  const imgDiv = document.createElement("div");
  const friendImage = document.createElement("img");
  friendImage.src = friend.image;
  imgDiv.classList.add("img__div");
  friendImage.classList.add("friend__image");
  imgDiv.append(friendImage);
  //外框連結
  const friendFrame = document.createElement("a");
  friendFrame.classList.add("friend__frame");
  friendFrame.append(imgDiv, msgDiv);
  friendList.append(friendFrame);
  friendList.append(LoadIcon);
  const chatsHref = `/chats/${friend.friend_id}`;
  friendFrame.href = chatsHref;
}

let messagesDiv = document.querySelector(".messages__div");

function checkScroll() {
  if (messagesDiv.scrollTop === 0) {
    chatsPage += 1;
    renderMessages();
  }
}

messagesDiv.addEventListener("scroll", checkScroll);

//得到聊天訊息
const msgRoomId = location.pathname.split("/").pop();
const chatsAPI = `/api/users/me/chatrooms/${msgRoomId}?page=`;
let chatsPage = 0;
let nextPage = 0;
let userId, userName, userImg, friendId, friendName, friendImg;
async function renderMessages() {
  if (nextPage === null) {
    return;
  }
  const chatroom = document.querySelector(".messages__div");
  const oldScrollHeight = chatroom.scrollHeight;
  const oldScrollTop = chatroom.scrollTop;
  const res = await fetch(chatsAPI + chatsPage);
  const data = await res.json();
  if (data.error) {
    const msgDiv = document.querySelector(".messages__div");
    msgDiv.textContent = data.message;
    document.querySelector(".submit").disabled = true;
    return;
  }
  if (data.data) {
    const info = data.data;
    const user = info.user;
    const friend = info.friend;
    userId = user.user_id;
    userName = user.name;
    userImg = user.image;
    friendId = friend.friend_id;
    friendName = friend.name;
    friendImg = friend.image;
    //render自己送信頭像
    document.querySelector("#avatar").src = userImg;
    document.querySelector("#useravatar").src = userImg;
    document.querySelector("#friendname").textContent = `寫信給${friendName}`;
    //render聊天室nav
    const friendNav = document.querySelector(".friend__nav");
    if (friendNav.innerHTML === "") {
      const friendInner = document.createElement("div");
      friendInner.classList.add("friend__inner");
      let h6 = document.createElement("h6");
      h6.textContent = friendName;
      let photoDiv = document.createElement("div");
      photoDiv.classList.add("photo__div");
      let photo = document.createElement("img");
      photo.classList.add("profile__photo");
      photo.src = friendImg;
      photoDiv.append(photo);
      friendInner.append(photoDiv, h6);
      friendNav.append(friendInner);
    }
    //render訊息
    info.messages.forEach((message) => {
      let messagesDiv = document.querySelector(".messages__div");
      //render發送者照片
      const profilePicture = document.createElement("img");
      profilePicture.classList.add("profile__photo");
      profilePicture.src = message.user_id == userId ? userImg : friendImg;
      let photoDiv = document.createElement("div");
      photoDiv.classList.add("photo__div");
      photoDiv.append(profilePicture);
      //render訊息傳送人
      const messageUser = document.createElement("h6");
      messageUser.textContent =
        message.user_id == userId ? userName : friendName;
      messageUser.classList.add("message__user");
      //render 訊息
      const msgText = document.createElement("p");
      msgText.textContent = message.message;
      msgText.classList.add("msg__text");
      const contentDiv = document.createElement("div");
      contentDiv.append(messageUser, msgText);
      const talkDiv = document.createElement("div");
      talkDiv.classList.add("talk__div");
      //render時間
      const createTime = document.createElement("p");
      createTime.textContent = message.sent_time;
      createTime.classList.add("create__time");
      //render聊天外框
      const rightDiv = document.createElement("div");
      rightDiv.append(createTime);
      const leftDiv = document.createElement("div");
      leftDiv.classList.add("left__div");
      leftDiv.append(photoDiv, contentDiv);
      talkDiv.append(leftDiv, rightDiv);
      messagesDiv.prepend(talkDiv);
      nextPage = data.data.nextPage;
      // //下滑到最新的聊天訊息
      // const chatroom = document.querySelector(".messages__div");
      // chatroom.scrollTop = chatroom.scrollHeight;
      const newScrollHeight = chatroom.scrollHeight;
      chatroom.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
    });
  }
}

//發送訊息
document.querySelector(".submit").addEventListener("click", sendMessage);
function sendMessage() {
  const messageText = document.querySelector("#messageText");
  let warnText = document.querySelector(".warn_text");
  warnText.textContent = "";
  if (messageText.value == "") {
    warnText.textContent = "請輸入內容！";
    return;
  }
  socket.emit("send_message", {
    userId: userId,
    name: userName,
    userImg: userImg,
    roomId: msgRoomId,
    message: messageText.value,
  });
  hideChatBox();
}
socket.on("receive_message", (data) => {
  receiveMessage(data);
  updatefriend(data);
});
function receiveMessage(data) {
  let messagesDiv = document.querySelector(".messages__div");
  //render發送者照片
  const profilePicture = document.createElement("img");
  profilePicture.classList.add("profile__photo");
  profilePicture.src = data.userImg;
  let photoDiv = document.createElement("div");
  photoDiv.classList.add("photo__div");
  photoDiv.append(profilePicture);
  //render訊息傳送人
  const messageUser = document.createElement("h6");
  messageUser.textContent = data.name;
  messageUser.classList.add("message__user");
  //render 訊息
  const msgText = document.createElement("p");
  msgText.textContent = data.message;
  msgText.classList.add("msg__text");
  const contentDiv = document.createElement("div");
  contentDiv.append(messageUser, msgText);
  const talkDiv = document.createElement("div");
  talkDiv.classList.add("talk__div");
  //render時間
  const createTime = document.createElement("p");
  createTime.textContent = data.time;
  createTime.classList.add("create__time");
  //render聊天外框
  const rightDiv = document.createElement("div");
  rightDiv.append(createTime);
  const leftDiv = document.createElement("div");
  leftDiv.classList.add("left__div");
  leftDiv.append(photoDiv, contentDiv);
  talkDiv.append(leftDiv, rightDiv);
  messagesDiv.append(talkDiv);
  document.querySelector("#messageText").value = "";
  //新聊天訊息滑到最下面
  const chatroom = document.querySelector(".messages__div");
  chatroom.scrollTop = chatroom.scrollHeight;
}

function updatefriend(data) {
  const updatemsg = document.querySelector(
    `a.friend__frame[href='/chats/${data.roomId}']`
  );
  const updateText = updatemsg.querySelector(".friend__msg");
  updateText.textContent = data.message;
  document.querySelector(".friend__list").prepend(updatemsg);
}

async function run() {
  await checkUserStatus();
  await fetchMsg();
  await joinRoom();
  await renderMessages();
}

run();
