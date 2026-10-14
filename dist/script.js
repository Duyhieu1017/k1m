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
const simPanel = document.querySelector('.sim-panel');
const scanView = document.querySelector('#scanView');
const completeView = document.querySelector('#completeView');
const sessionStatus = document.querySelector('#sessionStatus');
const footerStatus = document.querySelector('#footerStatus');
const footerRequests = document.querySelector('#footerRequests');

let timer;
let completionTimer;
let progress = 0;

const stages = [
  [8, 'Khởi tạo kết nối'],
  [28, 'Đang quét thư viện ảnh'],
  [52, 'Đang đọc danh bạ'],
  [74, 'Đang đóng gói tin nhắn'],
  [92, 'Đang chuẩn bị truyền dữ liệu'],
  [100, 'Hoàn tất lấy dữ liệu']
];

const logLines = [
  '> connection status: connected',
  '> permissions granted: success',
  '> local files accessed: 1261',
  '> phone number detected: 1261',
  '> outbound requests: 1817',
  '> data transferred: 100%'
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
  clearTimeout(completionTimer);
  progress = 0;
  simPanel.classList.remove('is-complete');
  completeView.classList.remove('is-live');
  scanView.hidden = false;
  completeView.hidden = true;
  sessionStatus.textContent = 'REMOTE SESSION // ACTIVE';
  footerStatus.textContent = 'CONNECTION_STATUS = PASSED';
  footerRequests.textContent = 'SIMULATION_ONLY = TRUE';
  lessonButton.hidden = true;
  updateStage();
  simulation.hidden = false;
  simulation.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (!safeExit.hidden) safeExit.focus();
  timer = setInterval(() => {
    progress = Math.min(100, progress + Math.ceil(Math.random() * 4));
    updateStage();
    if (progress === 100) {
      clearInterval(timer);
      completionTimer = setTimeout(showCompleteView, 650);
    }
  }, 230);
}

function showCompleteView() {
  scanView.hidden = true;
  completeView.hidden = false;
  simPanel.classList.add('is-complete');
  sessionStatus.textContent = 'PAYLOAD // EXTRACTION COMPLETE';
  footerStatus.textContent = 'TARGET_STATUS = CAPTURED';
  footerRequests.textContent = 'REAL_DATA_ACCESSED = 0';
  lessonButton.hidden = false;
  lessonButton.textContent = 'HIỂU CÁCH BẪY HOẠT ĐỘNG';
  requestAnimationFrame(() => completeView.classList.add('is-live'));
}

function closeSimulation(showLesson = false) {
  clearInterval(timer);
  clearTimeout(completionTimer);
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
