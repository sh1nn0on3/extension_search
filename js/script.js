// content.js
console.log("hello");

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
    console.log("Received data:", message.data);
    Stoken = message.data.token;
    localStorage.setItem("Stoken", Stoken);
  }
  if (message.command === "logSelection") {
    if (Stoken === "") {
      Stoken = localStorage.getItem("Stoken");
    }
    getInfoStatus(Stoken, codeLabel);
  }
});

const getInfoStatus = async (token, codeLabel) => {
  console.log("🚀 ~ getInfoStatus ~ token:", token);
  const apiUrl = `https://bypasscors.vercel.app/api/proxy?url=https://services.giaohangtietkiem.vn/services/shipment/v2/${codeLabel}&token=${token}`;
  const data = await fetchData(apiUrl);
  console.log("🚀 ~ getInfoStatus ~ data:", data);
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

// function createPopup(selectedText, x, y) {
//   // Tạo một div cho popup
//   console.log("🚀 ~ createPopup ~ selectedText", selectedText)
//   selectedText = {}

//   let popup = createElement('div', {
//     position: 'absolute',
//     top: `${y}px`,
//     left: `${x}px`,
//     backgroundColor: 'white',
//     border: '1px solid black',
//     padding: '10px',
//     zIndex: 10000,
//     boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)'
//   }, `
//     <div id="translated-text">Đang dịch...</div>
//     <button id="close-popup">Đóng</button>
//   `);

//   // Thêm sự kiện đóng popup
//   popup.querySelector('#close-popup').onclick = function() {
//     document.body.removeChild(popup);
//   };

//   // Thêm popup vào body
//   document.body.appendChild(popup);

//   // Tạo một div cho popup
//   function createElement(tag, attributes, innerHTML) {
//     let element = document.createElement(tag);
//     for (let key in attributes) {
//       element.style[key] = attributes[key];
//     }
//     if (innerHTML) {
//       element.innerHTML = innerHTML;
//     }
//     return element;
//   }
// }

function createPopup(selectedText, x, y) {
  console.log("🚀 ~ createPopup ~ selectedText:", selectedText);
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
      top: `${y}px`,
      left: `${x}px`,
      backgroundColor: "white",
      border: "1px solid black",
      padding: "10px",
      zIndex: 10000,
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
      borderRadius: "5px",
      width: "300px",
      fontFamily: "Arial, sans-serif",
    },
    `
    <ul id="translated-list" style="list-style: none; padding: 0;"></ul>
    <button id="close-popup" style="margin-top: 10px;">Đóng</button>
  `
  );

  popup.querySelector("#close-popup").onclick = function () {
    document.body.removeChild(popup);
  };

  document.body.appendChild(popup);

  let list = document.getElementById("translated-list");
  for (let key in jsonData) {
    let listItem = document.createElement("li");
    listItem.innerText = `${key}: ${jsonData[key]}`;
    listItem.style.padding = "5px 0";
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
