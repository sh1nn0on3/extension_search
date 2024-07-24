
const apiLogin = "https://web.giaohangtietkiem.vn/api/v1/auth/login";
const apiInfoOrder = "https://web.giaohangtietkiem.vn/api/v1/package/list-v3";
const apiInfoUser = "https://chat.ghtk.vn/api/v3/auth/access_token";

let count_ouders = 0;
const statusCount = {};

const funcLogin = async (data) => {
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
     
      if (!data.data.shop_token) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const Stoken = {
        token: data.data.shop_token,
        jwt: data.data.jwt,
      };
      return Stoken;
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false;
    });
  return dataResponse;
};

// localStorage.setItem
const dataOrderLocal = JSON.parse(localStorage.getItem("dataOrder"));
const dataUserLocal = JSON.parse(localStorage.getItem("dataUser"));
if (dataOrderLocal) {
  count_ouders = dataOrderLocal.count;
  document.getElementById("name_user").innerHTML = dataUserLocal.data.fullname;
  document.getElementById("count_order").innerHTML = count_ouders;
  countAndDisplayStatuses(dataOrderLocal.data, "statusCountContainer");
}

//
document.addEventListener("DOMContentLoaded", function () {

  if (localStorage.getItem("Stoken")) {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("logout-container").style.display = "block";
  } else {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("logout-container").style.display = "none";
  }

  document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const data = {
          username: username,
          password: password,
        };
        const token = await funcLogin(data);
        const dataOrder = await infoOrder(token.jwt);
        const dataUser = await infoUser(token.jwt);
        // const dataUser = { data: { fullname: "GHTK" } };
        localStorage.setItem("dataUser", JSON.stringify(dataUser));
        localStorage.setItem("dataOrder", JSON.stringify(dataOrder));
        if (token) {
          document.getElementById("login-form").style.display = "none";
          document.getElementById("name_user").innerHTML = dataUser.data.fullname;
          document.getElementById("count_order").innerHTML = dataOrder.count;
          countAndDisplayStatuses(dataOrderLocal.data, "statusCountContainer");
          document.getElementById("logout-container").style.display = "block";
        }
        sendData(token);
        localStorage.setItem("Stoken", token.token);
      } catch (error) {}
    });

  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      document.getElementById("login-form").style.display = "block";
      document.getElementById("logout-container").style.display = "none";
      sendData({ token: "" });
      localStorage.removeItem("Stoken");
      localStorage.removeItem("dataOrder");
    });
});

const infoOrder = async (token) => {
  const dataResponse = await fetch(apiInfoOrder, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ page: 1, limit: 200 }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false;
    });
  return dataResponse;
};

// infoUser
const infoUser = async (token) => {
  const dataResponse = await fetch(apiInfoUser, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "shop", token: token }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false;
    });


  const data = await fetch(apiInfoUser, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Apptype: "Moshop Web",
      Authorization: `Bearer ${dataResponse.data.access_token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false;
    });
  return data;
};

// devtool.js
function sendData(data) {
  chrome.runtime.sendMessage({ command: "sendData", data: data });
}

// countAndDisplayStatuses.js
function countAndDisplayStatuses(packageList, containerId) {
  const statusCount = {};
  packageList.forEach((package) => {
    const status = package.package_status_id_text;
    if (statusCount[status]) {
      statusCount[status] += 1;
    } else {
      statusCount[status] = 1;
    }
  });

  const statusCountContainer = document.getElementById(containerId);

  let htmlContent = "<ul>";
  for (const status in statusCount) {
    htmlContent += `<li>${status}: ${statusCount[status]}</li>`;
  }
  htmlContent += "</ul>";

  statusCountContainer.innerHTML = htmlContent;
}
