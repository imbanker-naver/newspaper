const modeFilter = document.getElementById('modeFilter');
const refreshButton = document.getElementById('refreshButton');
const logoutButton = document.getElementById('logoutButton');
const submissionCount = document.getElementById('submissionCount');
const userCount = document.getElementById('userCount');
const lastSubmission = document.getElementById('lastSubmission');
const submissionRows = document.getElementById('submissionRows');
const userRows = document.getElementById('userRows');

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', { hour12: false });
  } catch {
    return isoString;
  }
}

async function requireAdminUser(user) {
  if (!user) {
    window.location.href = 'index.html';
    return false;
  }

  const userDoc = await db.collection('users').doc(user.uid).get();
  const role = userDoc.exists ? userDoc.data().role : 'user';

  if (role !== 'admin') {
    window.location.href = 'deal.html';
    return false;
  }

  return true;
}

async function fetchUsers() {
  const snapshot = await db.collection('users').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchSubmissions() {
  const snapshot = await db.collection('submissions').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function renderUsers(users) {
  userCount.textContent = users.length;

  if (!users.length) {
    userRows.innerHTML = '<li>회원 정보가 없습니다.</li>';
    return;
  }

  userRows.innerHTML = '';
  users.forEach((user) => {
    const item = document.createElement('li');
    const roleLabel = user.role === 'admin' ? '관리자' : '일반회원';
    item.textContent = `${user.name} / ${user.email} / ${roleLabel} / 가입일: ${formatDate(user.created_at)}`;
    userRows.appendChild(item);
  });
}

function renderTable(submissions) {
  const filtered = submissions.filter((submission) => {
    if (modeFilter.value === 'all') return true;
    return submission.mode === modeFilter.value;
  });

  if (!filtered.length) {
    submissionRows.innerHTML = '<tr><td colspan="8" class="empty-row">제출 정보가 없습니다.</td></tr>';
    submissionCount.textContent = '0';
    lastSubmission.textContent = '-';
    return;
  }

  submissionRows.innerHTML = '';
  filtered.forEach((submission, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${formatDate(submission.created_at)}</td>
      <td>${submission.mode === 'sell' ? '매각 희망' : '인수 희망'}</td>
      <td>${submission.email}</td>
      <td>${submission.revenueRange}</td>
      <td>${submission.price}억원</td>
      <td>${submission.searchAffiliation}</td>
      <td>
        <details>
          <summary>보기</summary>
          <div class="details-content">
            <p><strong>매체 유형:</strong> ${submission.mediaTypes.length ? submission.mediaTypes.join(', ') : '선택 없음'}</p>
            <p><strong>하고 싶은 말:</strong> ${submission.notes || '없음'}</p>
          </div>
        </details>
      </td>
    `;
    submissionRows.appendChild(row);
  });

  submissionCount.textContent = filtered.length;
  lastSubmission.textContent = formatDate(filtered[0].created_at);
}

async function loadDashboard() {
  try {
    const [submissions, users] = await Promise.all([fetchSubmissions(), fetchUsers()]);
    renderUsers(users);
    renderTable(submissions);
  } catch (error) {
    submissionRows.innerHTML = '<tr><td colspan="8" class="empty-row">관리자 데이터를 불러오지 못했습니다.</td></tr>';
  }
}

logoutButton.addEventListener('click', async () => {
  await auth.signOut();
  window.location.href = 'index.html';
});

refreshButton.addEventListener('click', () => loadDashboard());
modeFilter.addEventListener('change', () => loadDashboard());

auth.onAuthStateChanged(async (user) => {
  const ok = await requireAdminUser(user);
  if (ok) loadDashboard();
});
