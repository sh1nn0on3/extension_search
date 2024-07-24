// content.js

let codeLabel = "";
let Stoken = "";
let eventX = 0;
let eventY = 0;

document.addEventListener("mouseup", function (event) {
  eventX = event.pageX;
  eventY = event.pageY;
  codeLabel = window.getSelection().toString();
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.data) {
    Stoken = message.data.token;
    localStorage.setItem("Stoken", Stoken);
  }
  if (message.command === "logSelection") {
    if (Stoken === "") {
      Stoken = localStorage.getItem("Stoken");
    }
    getInfoStatus(Stoken, codeLabel);
  }

  if (message.command === "createOrder") {
    console.log("Create order");
  }
});

const getInfoStatus = async (token, codeLabel) => {
  const apiUrl = `https://bypasscors.vercel.app/api/proxy?url=https://services.giaohangtietkiem.vn/services/shipment/v2/${codeLabel}&token=${token}`;
  const data = await fetchData(apiUrl);
  createPopup(data, eventX, eventY);
  return data;
};

// content.js
async function fetchData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return false;
  }
}

function createPopup(selectedText, x, y) {
  let jsonData = {};
  if (selectedText.success) {
    jsonData = {
      label_id: selectedText.order.label_id,
      address: selectedText.order.address,
      created: selectedText.order.created,
      deliver_date: selectedText.order.deliver_date,
      full_name: selectedText.order.products[0].full_name,
      status: selectedText.order.status,
      status_text: selectedText.order.status_text,
    };
  } else if (selectedText.error_code == "20101") {
    jsonData = {
      status: "Cần đăng nhập tài khoản",
    };
  } else {
    jsonData = {
      status: "không thấy dữ liệu",
    };
  }

  let popup = createElement(
    "div",
    {
      position: "absolute",
      color: "#333",
      top: `${y}px`,
      left: `${x}px`,
      backgroundColor: "white",
      border: "1px solid #ccc",
      padding: "15px",
      zIndex: 10000,
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      width: "320px",
      fontFamily: "Arial, sans-serif",
      lineHeight: "1.6",
    },
    `
    <ul id="translated-list" style="list-style: none; padding: 0; margin: 0;"></ul>
    <button id="close-popup" style="
      margin-top: 15px;
      padding: 8px 16px;
      background-color: #069354;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    ">Đóng</button>
    `
  );

  popup.querySelector("#close-popup").onclick = function () {
    document.body.removeChild(popup);
  };

  document.body.appendChild(popup);

  let list = document.getElementById("translated-list");
  for (let key in jsonData) {
    let listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${key}:</strong> ${jsonData[key]}`;
    listItem.style.padding = "5px 0";
    listItem.style.width = "100%";
    listItem.style.borderBottom = "1px solid #eee";
    listItem.style.display = "flex";
    listItem.style.justifyContent = "space-between";
    listItem.style.alignItems = "center";
    listItem.style.color = "#555";
    list.appendChild(listItem);
  }

  function createElement(tag, attributes, innerHTML) {
    let element = document.createElement(tag);
    for (let key in attributes) {
      element.style[key] = attributes[key];
    }
    if (innerHTML) {
      element.innerHTML = innerHTML;
    }
    return element;
  }
}
