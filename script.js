const video = document.getElementById("video");
const canvas = document.getElementById("frameCanvas");
const ctx = canvas.getContext("2d");
const captureBtn = document.getElementById("captureBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");
const countdownEl = document.getElementById("countdown");
const frameSelect = document.getElementById("frameSelect");
const galleryContainer = document.getElementById("galleryContainer");

let slot = 0;
let currentFrame = "default";
let photoCount = 0;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => {
    console.error("Gagal akses kamera:", err);
    alert("Izinkan kamera di browser agar bisa dipakai!");
  });

function drawFrame() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 4;

  if (currentFrame === "default") {
    ctx.strokeStyle = "#4a90e2";
  } else if (currentFrame === "colorful") {
    ctx.strokeStyle = "#ff6347"; // merah oranye
  } else if (currentFrame === "cute") {
    ctx.strokeStyle = "pink";
  }

  for (let i = 0; i < 3; i++) {
    ctx.strokeRect(35, 20 + i * 290, 230, 230);
  }

  ctx.fillStyle = "#4a90e2";
  ctx.font = "bold 18px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("Mini Photobooth", canvas.width / 2, 880);
}

drawFrame();

function takePhoto() {
  if (slot < 3) {
    const x = 35;
    const y = 20 + slot * 290;
    const size = 230;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const aspect = vw / vh;

    let sx, sy, sw, sh;
    if (aspect > 1) {
      sh = vh; sw = vh; sx = (vw - sw) / 2; sy = 0;
    } else {
      sw = vw; sh = vw; sx = 0; sy = (vh - sh) / 2;
    }

    ctx.drawImage(video, sx, sy, sw, sh, x, y, size, size);

    slot++;
    if (slot === 3) {
      downloadBtn.disabled = false;
    }
  } else {
    alert("Semua slot sudah terisi!");
  }
}

function startCountdown(seconds, callback) {
  let timeLeft = seconds;
  countdownEl.style.display = "block";
  countdownEl.textContent = timeLeft;

  const interval = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      countdownEl.style.display = "none";
      callback();
    }
  }, 1000);
}

captureBtn.addEventListener("click", () => {
  if (slot < 3) {
    startCountdown(3, takePhoto);
  } else {
    alert("Strip penuh, reset dulu.");
  }
});

resetBtn.addEventListener("click", () => {
  slot = 0;
  drawFrame();
  downloadBtn.disabled = true;
});

downloadBtn.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");

  photoCount++;
  const fileName = `photobooth-${photoCount}.png`;

  // simpan ke gallery
  const wrapper = document.createElement("div");
  wrapper.className = "gallery-item";

  const img = document.createElement("img");
  img.src = dataURL;

  const dlBtn = document.createElement("button");
  dlBtn.textContent = "💾 Download";
  dlBtn.className = "btn";
  dlBtn.style.fontSize = "12px";
  dlBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataURL;
    link.click();
  });

  wrapper.appendChild(img);
  wrapper.appendChild(dlBtn);
  galleryContainer.appendChild(wrapper);

  // reset strip
  slot = 0;
  drawFrame();
  downloadBtn.disabled = true;
});

frameSelect.addEventListener("change", (e) => {
  currentFrame = e.target.value;
  slot = 0;
  drawFrame();
});