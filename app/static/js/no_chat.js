import { checkUserStatus } from "./user.js";
async function run() {
  let loginStatus = await checkUserStatus();
  if (!loginStatus) {
    window.location.href = "/login";
    return;
  }
}

run();
