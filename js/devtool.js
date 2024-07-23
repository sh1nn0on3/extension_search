// devtools.js
console.log("hello devtool");

const apiLogin = "https://web.giaohangtietkiem.vn/api/v1/auth/login";

const funcLogin = async (data) => {
  console.log("🚀 ~ funcLogin ~ data:", data);
  const dataResponse = await fetch(apiLogin, {
    method: "Post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.data.shop_token); // Xử lý dữ liệu từ API
      if (!data.data.shop_token) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      alert("Login Success");
      const Stoken = {
        token: data.data.shop_token,
      };
      return Stoken;
    })
    .catch((error) => {
      alert("Login Failed");
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false;
    });
  return dataResponse;
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Popup DOM loaded and parsed");

  document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Xử lý logic đăng nhập tại đây (ví dụ: xác thực thông tin đăng nhập)
      try {
        const data = {
          username: username,
          password: password,
        };
        const token = await funcLogin(data);
        console.log("🚀 ~ document.getElementById ~ token:", token);

        // Gửi dữ liệu đến background.js
        sendData(token);
      } catch (error) {
        console.error("Login failed:", error);
      }
    });
});

// devtool.js

function sendData(data) {
  console.log("🚀 ~ sendData ~ data:", data);
  chrome.runtime.sendMessage({ command: "sendData", data: data });
}
