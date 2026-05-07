const modeFilter = document.getElementById('modeFilter');
const refreshButton = document.getElementById('refreshButton');
const logoutButton = document.getElementById('logoutButton');
const submissionCount = document.getElementById('submissionCount');
const userCount = document.getElementById('userCount');
const lastSubmission = document.getElementById('lastSubmission');
const submissionRows = document.getElementById('submissionRows');
const userRows = document.getElementById('userRows');

async function fetchSubmissions() {
  try {
    const res = await fetch('/api/submissions');
    if (res.status === 401) {
      window.location.href = '/login.html';
      return [];
    }

    if (!res.ok) {
      throw new Error('제출 목록을 불러오는 중 오류가 발생했습니다.');
    }
    const data = await res.json();
    return data.submissions || [];
  } catch (error) {
    submissionRows.innerHTML = `<tr><td colspan="8" class="empty-row">${error.message}</td></tr>`;
    return [];
  }
}

async function fetchUsers() {
  try {
    const res = await fetch('/api/users');
    if (res.status === 401) {
      window.location.href = '/login.html';
      return [];
    }

    if (!res.ok) {
      throw new Error('회원 목록을 불러오는 중 오류가 발생했습니다.');
    }
    const data = await res.json();
    return data.users || [];
  } catch (error) {
    userRows.innerHTML = `<li>${error.message}</li>`;
    return [];
  }
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', { hour12: false });
  } catch {
    return isoString;
  }
}

function renderUsers(users) {
  const sortedUsers = users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  userCount.textContent = sortedUsers.length;

  if (!sortedUsers.length) {
    userRows.innerHTML = '<li>회원 정보가 없습니다.</li>';
    return;
  }

  userRows.innerHTML = '';
  sortedUsers.forEach((user) => {
    const item = document.createElement('li');
    const roleLabel = user.role === 'admin' ? '관리자' : '일반회원';
    item.textContent = `${user.name} / ${user.email} / ${roleLabel} / 가입일: ${formatDate(user.created_at)}`;
    userRows.appendChild(item);
  });
}

function renderTable(submissions) {
  if (!submissions.length) {
    submissionRows.innerHTML = '<tr><td colspan="8" class="empty-row">제출 정보가 없습니다.</td></tr>';
    submissionCount.textContent = '0';
    lastSubmission.textContent = '-';
    return;
  }

  submissionRows.innerHTML = '';
  const filtered = submissions.filter((submission) => {
    if (modeFilter.value === 'all') return true;
    return submission.mode === modeFilter.value;
  });

  if (!filtered.length) {
    submissionRows.innerHTML = '<tr><td colspan="8" class="empty-row">선택된 필터에 맞는 제출이 없습니다.</td></tr>';
    submissionCount.textContent = filtered.length;
    lastSubmission.textContent = '-';
    return;
  }

  filtered.forEach((submission) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${submission.id}</td>
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
  const [submissions, users] = await Promise.all([fetchSubmissions(), fetchUsers()]);
  renderUsers(users);
  renderTable(submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
}

logoutButton.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

refreshButton.addEventListener('click', () => loadDashboard());
modeFilter.addEventListener('change', () => loadDashboard());

loadDashboard();
