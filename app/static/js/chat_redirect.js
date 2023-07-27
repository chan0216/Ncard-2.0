import { checkUserStatus } from "./user.js";
async function getLastChatroomId() {
  const response = await fetch(`/api/users/me/chatrooms/last`);
  const data = await response.json();
  let chat_tag = document.querySelector(".chat");
  if (data.data) {
    chat_tag.href = "/chats/" + data.data;
  } else {
    chat_tag.href = "/chats";
  }
}

async function run() {
  await checkUserStatus();
  await getLastChatroomId();
}

run();
