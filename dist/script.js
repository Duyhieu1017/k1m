const revealButton = document.querySelector('#revealButton');
const simulation = document.querySelector('#simulation');
const safeExit = document.querySelector('#safeExit');
const lessonButton = document.querySelector('#lessonButton');
const lessonToast = document.querySelector('#lessonToast');
const lessonClose = document.querySelector('#lessonClose');
const progressBar = document.querySelector('#progressBar');
const progressValue = document.querySelector('#progressValue');
const stageLabel = document.querySelector('#stageLabel');
const log = document.querySelector('#log');

let timer;
let progress = 0;

const stages = [
  [8, 'Khởi tạo kết nối giả lập'],
  [28, 'Đang quét thư viện ảnh (mô phỏng)'],
  [52, 'Đang đọc danh bạ (mô phỏng)'],
  [74, 'Đang đóng gói tin nhắn (mô phỏng)'],
  [92, 'Đang chuẩn bị truyền dữ liệu (mô phỏng)'],
  [100, 'Đã chặn — không có dữ liệu nào được gửi']
];

const logLines = [
  '> sandbox handshake: demo_only',
  '> permissions granted: none',
  '> local files accessed: 0',
  '> outbound requests: 0',
  '> training safeguard: active'
];

function updateStage() {
  const current = stages.find(([limit]) => progress <= limit) || stages.at(-1);
  stageLabel.textContent = current[1];
  progressValue.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
  const visible = Math.min(logLines.length, Math.floor(progress / 18) + 1);
  log.innerHTML = logLines.slice(0, visible).map(line => `<p>${line}</p>`).join('');
}

function openSimulation() {
  clearInterval(timer);
  progress = 0;
  updateStage();
  simulation.hidden = false;
  simulation.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  safeExit.focus();
  timer = setInterval(() => {
    progress = Math.min(100, progress + Math.ceil(Math.random() * 4));
    updateStage();
    if (progress === 100) {
      clearInterval(timer);
      lessonButton.textContent = 'HIỂU CÁCH BẪY HOẠT ĐỘNG';
    }
  }, 230);
}

function closeSimulation(showLesson = false) {
  clearInterval(timer);
  simulation.hidden = true;
  simulation.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  revealButton.focus();
  if (showLesson) lessonToast.hidden = false;
}

revealButton.addEventListener('click', openSimulation);
safeExit.addEventListener('click', () => closeSimulation(true));
lessonButton.addEventListener('click', () => closeSimulation(true));
lessonClose.addEventListener('click', () => { lessonToast.hidden = true; });

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!simulation.hidden) {
    closeSimulation(true);
  } else if (!lessonToast.hidden) {
    lessonToast.hidden = true;
  }
});
