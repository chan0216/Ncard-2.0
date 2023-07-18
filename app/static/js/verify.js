import { checkUserStatus } from "./user.js";
let schoolPopup = document.querySelector(".school__popup");
let schoolPopupSelect = document.querySelector(".school__popup-select");
let loadMore = document.querySelector("#loadMore");
let dynamicContent = document.querySelector("#dynamicContent");
let universitySelect = document.querySelector("#universitySelect");
let genderPopup = document.querySelector(".gender_popup");
let gender = document.querySelector("#gender");
let userFormSubmit = document.querySelector(".userform__submit");
let userFormAlert = document.querySelector(".userform__alert");
let isGenderPopupOpen = false;

let page = 0;
const getUniversities = async () => {
  const result = await fetch(`/api/universities?page=${page}`);
  const data = await result.json();
  const res = data.data;
  page = data["nextPage"];
  if (page == null) {
    observer.unobserve(loadMore);
    loadMore.style.display = "None";
  }
  renderSchool(res);
};

universitySelect.addEventListener("click", openUniversityPopup);
schoolPopup.addEventListener("click", closeUniversityPopup);

schoolPopupSelect.addEventListener("click", function (event) {
  event.stopPropagation();
});

function openUniversityPopup() {
  schoolPopup.style.display = "block";
}

function closeUniversityPopup() {
  schoolPopup.style.display = "none";
}

let options = { threshold: 0.5 };
let renderNextPages = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      getUniversities();
    }
  });
};
let observer = new IntersectionObserver(renderNextPages, options);
observer.observe(loadMore);

function renderSchool(res) {
  for (const obj of res) {
    let schoolDiv = document.createElement("div");
    schoolDiv.textContent = obj;
    schoolDiv.style.padding = "10px";
    schoolDiv.style.cursor = "pointer";
    dynamicContent.appendChild(schoolDiv);
    schoolDiv.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#F2F3F4";
    });

    schoolDiv.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "";
    });
    schoolDiv.addEventListener("click", function () {
      let selectedUniversity = document.querySelector("#selectedUniversity");
      selectedUniversity.text = obj;
      selectedUniversity.value = obj;
      universitySelect.style.color = "black";
      universitySelect.value = obj;
      closeUniversityPopup();
    });
  }
}

gender.addEventListener("click", toggleGenderPopup);

function toggleGenderPopup(event) {
  event.stopPropagation();
  if (isGenderPopupOpen) {
    closeGenderPopup();
  } else {
    openGenderPopup();
  }
}

function openGenderPopup() {
  genderPopup.style.display = "block";
  gender.style.borderBottomLeftRadius = "0px";
  gender.style.borderBottomRightRadius = "0px";
  isGenderPopupOpen = true;
}

function closeGenderPopup() {
  genderPopup.style.display = "none";
  gender.style.borderBottomLeftRadius = "10px";
  gender.style.borderBottomRightRadius = "10px";
  isGenderPopupOpen = false;
}

document.addEventListener("click", function (event) {
  if (isGenderPopupOpen && !genderPopup.contains(event.target)) {
    genderPopup.style.display = "none";
    isGenderPopupOpen = false;
    gender.style.borderBottomLeftRadius = "10px";
    gender.style.borderBottomRightRadius = "10px";
  }
});

let newOptionMale = document.createElement("option");
newOptionMale.style.paddingTop = "5px";
newOptionMale.style.paddingBottom = "5px";
newOptionMale.style.paddingLeft = "5px";
newOptionMale.textContent = "男生";
newOptionMale.value = "M";
newOptionMale.addEventListener("click", function () {
  selectedGender.textContent = newOptionMale.textContent;
  selectedGender.value = newOptionMale.value;
  gender.style.color = "black";
  closeGenderPopup();
});

let newOptionFemale = document.createElement("option");
newOptionFemale.style.paddingTop = "5px";
newOptionFemale.style.paddingBottom = "5px";
newOptionFemale.style.paddingLeft = "5px";
newOptionFemale.textContent = "女生";
newOptionFemale.value = "F";
newOptionFemale.addEventListener("click", function () {
  selectedGender.textContent = newOptionFemale.textContent;
  selectedGender.value = newOptionFemale.value;
  gender.style.color = "black";
  closeGenderPopup();
});
genderPopup.appendChild(newOptionFemale);
genderPopup.appendChild(newOptionMale);

newOptionMale.addEventListener("mouseenter", function () {
  this.style.backgroundColor = "#F2F3F4";
});

newOptionMale.addEventListener("mouseleave", function () {
  this.style.backgroundColor = "";
});

newOptionFemale.addEventListener("mouseenter", function () {
  this.style.backgroundColor = "#F2F3F4";
});

newOptionFemale.addEventListener("mouseleave", function () {
  this.style.backgroundColor = "";
});

userFormSubmit.addEventListener("click", function () {
  submitProfile();
});

//提交基本資料
const submitProfile = async () => {
  let user_data = await checkUserStatus();
  if (!user_data) {
    return;
  }
  let name = document.querySelector("#fullname").value;
  let gender = selectedGender.value;
  let school = selectedUniversity.value;
  if (fullname === "" || school === "" || gender == "") {
    userFormAlert.textContent = "資料請輸入完整";
    return;
  }
  userFormAlert.innerText = "";
  const profile = {
    update_type: "basic_info",
    name: name,
    gender: gender,
    school: school,
  };
  const config = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  };
  const response = await fetch(`/api/users/me`, config);
  const data = await response.json();
  if (data.ok) {
    document.querySelector(".userform__popup").style.display = "block";
  } else {
    if (response.status === 404) {
      userFormAlert.textContent = "找不到使用者，請重新登入";
    } else if (response.status === 400) {
      userFormAlert.textContent = "你已經填寫過囉";
    } else {
      userFormAlert.textContent = "填寫失敗，請重新嘗試";
    }
  }
};

async function run() {
  let loginStatus = await checkUserStatus();
  if (!loginStatus) {
    window.location.href = "/login";
  }
}

run();
