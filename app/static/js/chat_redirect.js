import { checkUserStatus } from "./user.js";
async function getLastChatroomId() {
  const response = await fetch(`/api/users/me/chatrooms?last=true`);
  const data = await response.json();
  let chatTag = document.querySelector(".chat");
  if (data.data) {
    chatTag.href = "/chats/" + data.data;
  } else {
    chatTag.href = "/chats";
  }
}

async function run() {
  await checkUserStatus();
  await getLastChatroomId();
}

run();
