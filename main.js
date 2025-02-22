const input = document.getElementById("input");
const genButton = document.getElementById("generate");
const qrDisplay = document.getElementById("qr");
const body = document.querySelector("body");
const size = document.getElementById("size");
const format = document.getElementById("format");
const readButton = document.getElementById("read");
const readInput = document.getElementById("file");
const readResult = document.getElementById("result");

genButton.addEventListener("click", () => {
  if (
    input.value.trim() === "" ||
    size.value.trim() === "" ||
    size.value > 500 ||
    size.value < 100
  ) {
    alert("Please enter a valid input and size between 100 and 500");
  } else {
    const color = document.getElementById("color").value.replace("#", "");
    const bgColor = document.getElementById("bgcolor").value.replace("#", "");
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size.value}x${size.value}&color=${color}&bgcolor=${bgColor}&format=${format.value}&data=${input.value}`;
    qrDisplay.src = url;
    qrDisplay.style.display = "block";
  }
});

qrDisplay.addEventListener("click", function () {
  const imgUrl = this.src;

  fetch(imgUrl)
    .then((response) => response.blob()) // Convert the image to a blob
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${input.value} qr-code.${format.value}`; // Set filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Cleanup
    })
    .catch((error) => console.error("Error downloading image:", error));
});

readButton.addEventListener("click", () => {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:[a-zA-Z0-9-]+\.)?(?:com|net|org|edu|gov|mil|io|dev|info|biz|co|xyz|me|tv|us|uk|ca|au|in|eu|fr|de|cn|jp|ru|br|sa||eg||fun)(?:\/\S*)?$/;
  if (validateFile(readInput)) {
    const formData = new FormData();
    formData.append("file", readInput.files[0]);

    fetch("https://api.qrserver.com/v1/read-qr-code/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data[0] && data[0].symbol[0].data) {
          if (regex.test(data[0].symbol[0].data)) {
            if (
              data[0].symbol[0].data.startsWith("http://") ||
              data[0].symbol[0].data.startsWith("https://")
            ) {
              document.getElementById(
                "result"
              ).innerHTML = `QR Code Content: <a href="${data[0].symbol[0].data}" target="_blank">${data[0].symbol[0].data}</a>`;
            } else {
              document.getElementById(
                "result"
              ).innerHTML = `QR Code Content: <a href="http://${data[0].symbol[0].data}" target="_blank">${data[0].symbol[0].data}</a>`;
            }
          } else {
            document.getElementById("result").textContent =
              "QR Code Content: " + data[0].symbol[0].data;
          }
        } else {
          document.getElementById("result").textContent = "No QR code found.";
        }
      })
      .catch((error) => console.error("Error:", error));
  }
});

function validateFile(input) {
  const file = input.files[0]; // Get the selected file
  if (!file) {
    alert("Please select a file.");
    return false;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    alert("Only image files (PNG, JPG, JPEG, GIF) are allowed.");
    input.value = ""; // Clear the file input
    return false;
  }

  return true;
}
