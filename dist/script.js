const revealButtons = [...document.querySelectorAll('.reveal-button')];
let activeRevealButton = revealButtons[0];
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

const memberNames = ['hngoc245', 'huyenmeow', 'hungbe', 'thutrangkt', 'haprh'];

function shuffledMemberNames() {
  const names = [...memberNames];
  for (let index = names.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [names[index], names[randomIndex]] = [names[randomIndex], names[index]];
  }
  return names;
}

function randomizePostAuthors() {
  const authors = [...document.querySelectorAll('.post-card .username')];
  let pool = [];
  let previousName = '';

  authors.forEach(author => {
    if (pool.length === 0) {
      pool = shuffledMemberNames();
      if (pool[0] === previousName) [pool[0], pool[1]] = [pool[1], pool[0]];
    }
    const name = pool.shift();
    author.textContent = name;
    previousName = name;
  });
}

randomizePostAuthors();

function randomizePostTimes() {
  const postTimes = [...document.querySelectorAll('.post-card .post-meta time')];
  if (postTimes.length === 0) return;

  const today = new Date();
  const midnight = new Date(today);
  midnight.setHours(0, 0, 0, 0);
  const yesterdayEvening = new Date(midnight);
  yesterdayEvening.setDate(yesterdayEvening.getDate() - 1);
  yesterdayEvening.setHours(19 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
  const latestTime = midnight.getTime() + 3 * 60 * 60_000;
  const yesterdayCount = Math.min(postTimes.length - 1, 3 + Math.floor(Math.random() * 3));
  const todayCount = postTimes.length - yesterdayCount;

  const spreadTimes = (count, start, end) => {
    if (count <= 0) return [];
    const slice = (end - start) / count;
    return Array.from({ length: count }, (_, index) => (
      start + slice * index + Math.random() * slice
    ));
  };

  const timestamps = [
    ...spreadTimes(yesterdayCount, yesterdayEvening.getTime(), midnight.getTime() - 60_000),
    ...spreadTimes(todayCount, midnight.getTime() + 60_000, latestTime)
  ];
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  postTimes.forEach((time, index) => {
    const value = new Date(timestamps[index]);
    const valueKey = `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
    const label = valueKey === todayKey ? 'Hôm nay' : 'Hôm qua';
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');

    time.dateTime = value.toISOString();
    time.textContent = `${label} lúc ${hours}:${minutes}`;
  });
}

randomizePostTimes();

function makeExpandableCopy(copy, index) {
    copy.classList.remove('collapsed-copy');
    copy.classList.add('expandable-copy', 'is-collapsed');
    copy.id ||= `post-copy-${index + 1}`;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'read-more-toggle';
    toggle.textContent = 'Xem thêm';
    toggle.setAttribute('aria-controls', copy.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.hidden = true;
    copy.insertAdjacentElement('afterend', toggle);

    const syncVisibility = () => {
      if (!copy.classList.contains('is-collapsed')) return;
      toggle.hidden = copy.scrollHeight <= copy.clientHeight + 1;
    };

    toggle.addEventListener('click', () => {
      const willExpand = copy.classList.contains('is-collapsed');
      copy.classList.toggle('is-collapsed', !willExpand);
      toggle.textContent = willExpand ? 'Thu gọn' : 'Xem thêm';
      toggle.setAttribute('aria-expanded', String(willExpand));
      toggle.hidden = false;
    });

    requestAnimationFrame(syncVisibility);
    new ResizeObserver(syncVisibility).observe(copy.parentElement);
}

function setupExpandablePosts() {
  const copies = [...document.querySelectorAll('.post-copy, .compact-post .post-body > p')];
  copies.forEach(makeExpandableCopy);
}

setupExpandablePosts();

const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatCount = document.querySelector('#chat-count');
const chatComposer = document.querySelector('#chat-composer');

chatInput?.addEventListener('input', () => {
  chatCount.textContent = String(chatInput.value.length);
});

chatForm?.addEventListener('submit', event => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) {
    chatInput.focus();
    return;
  }

  const post = document.createElement('article');
  post.className = 'post-card compact-post user-post';
  post.innerHTML = `
    <aside class="profile">
      <div class="avatar" aria-hidden="true"><span>ME</span></div>
      <span class="username">bạn</span>
      <span class="rank">THÀNH VIÊN</span>
    </aside>
    <div class="post-body">
      <header class="post-meta"><time>Vừa xong</time><span>Bình luận mới</span></header>
      <p class="user-message"></p>
    </div>`;
  post.querySelector('.user-message').textContent = message;
  chatComposer.insertAdjacentElement('beforebegin', post);
  makeExpandableCopy(post.querySelector('.user-message'), document.querySelectorAll('.expandable-copy').length);

  chatForm.reset();
  chatCount.textContent = '0';
  post.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

let timer;
let progress = 0;
const scanDurationMs = 2000;

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
  '> phone number detected: 438',
  '> sms detected: 2904',
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
  const startedAt = performance.now();
  timer = setInterval(() => {
    const elapsed = performance.now() - startedAt;
    progress = Math.min(100, Math.round((elapsed / scanDurationMs) * 100));
    updateStage();
    if (progress >= 100) {
      clearInterval(timer);
      showCompleteView();
    }
  }, 40);
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
  simulation.hidden = true;
  simulation.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  activeRevealButton?.focus();
  if (showLesson) lessonToast.hidden = false;
}

function isPointOverText(element, x, y) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let textNode;

  while ((textNode = walker.nextNode())) {
    if (!textNode.textContent.trim()) continue;
    range.selectNodeContents(textNode);
    const hitsText = [...range.getClientRects()].some(rect => (
      x >= rect.left - 2 && x <= rect.right + 2 &&
      y >= rect.top - 2 && y <= rect.bottom + 2
    ));
    if (hitsText) return true;
  }

  return false;
}

document.addEventListener('click', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('#simulation, #lessonToast')) return;
  if (!simulation.hidden) return;

  const interactiveTarget = target.closest('a, button, input, textarea, select, label, img, [role="button"]');
  const clickedContent = interactiveTarget || isPointOverText(target, event.clientX, event.clientY);
  if (!clickedContent) return;

  event.preventDefault();
  activeRevealButton = target.closest('.reveal-button') || activeRevealButton;
  openSimulation();
});
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
