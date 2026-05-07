const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { saveSubmission, loadSubmissions, saveUser, loadUsers } = require('./db');
const { sendAdminNotification, sendUserConfirmation, ADMIN_EMAIL } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    created_at: user.created_at,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
  };
}

app.post('/api/register', (req, res) => {
  const { name = '', email = '', password = '' } = req.body;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (!trimmedName || !trimmedEmail || !password) {
    return res.status(400).json({ error: '이름, 이메일, 비밀번호를 모두 입력해 주세요.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: '올바른 이메일 주소를 입력해 주세요.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상 입력해 주세요.' });
  }

  const user = {
    created_at: new Date().toISOString(),
    name: trimmedName,
    email: trimmedEmail,
    role: trimmedEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
    passwordHash: createPasswordHash(password),
  };

  saveUser(user, (dbErr, userId) => {
    if (dbErr) {
      if (dbErr.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ error: dbErr.message });
      }

      console.error('회원가입 저장 실패:', dbErr);
      return res.status(500).json({ error: '회원가입 정보를 저장하지 못했습니다.' });
    }

    res.status(201).json({
      userId,
      message: '회원가입이 완료되었습니다.',
      user: sanitizeUser(Object.assign({ id: userId }, user)),
    });
  });
});

app.post('/api/submit', async (req, res) => {
  const {
    mode,
    searchAffiliation,
    mediaTypes = [],
    revenueRange,
    price,
    notes = '',
    email,
  } = req.body;

  if (!mode || !['sell', 'buy'].includes(mode)) {
    return res.status(400).json({ error: '유효한 모드를 선택하세요.' });
  }

  if (!searchAffiliation || !revenueRange || !price || !email) {
    return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
  }

  const submission = {
    created_at: new Date().toISOString(),
    mode,
    searchAffiliation,
    mediaTypes,
    revenueRange,
    price,
    notes,
    email,
  };

  saveSubmission(submission, async (dbErr, submissionId) => {
    if (dbErr) {
      console.error('DB 저장 실패:', dbErr);
      return res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
    }

    let emailStatus = [];

    try {
      await sendAdminNotification(submission);
      emailStatus.push('관리자 이메일 전송 완료');
    } catch (mailErr) {
      console.error('관리자 이메일 전송 실패:', mailErr);
      emailStatus.push('관리자 이메일 전송에 실패했습니다. 서버 설정을 확인하세요.');
    }

    try {
      await sendUserConfirmation(submission);
      emailStatus.push('희망자 확인 이메일 전송 완료');
    } catch (mailErr) {
      console.error('희망자 이메일 전송 실패:', mailErr);
      emailStatus.push('희망자 이메일 전송에 실패했습니다. 서버 설정을 확인하세요.');
    }

    const summary = [
      `${mode === 'sell' ? '매각 희망' : '인수 희망'} 접수 정보`,
      `네이버 검색제휴 여부: ${searchAffiliation}`,
      `매체 유형: ${mediaTypes.length ? mediaTypes.join(', ') : '선택 없음'}`,
      `2025년도 매출: ${revenueRange}`,
      `${mode === 'sell' ? '매각 희망가' : '인수 희망가'}: ${price}억원`,
      `하고 싶은 말: ${notes || '없음'}`,
      `이메일: ${email}`,
      `관리자 이메일: ${ADMIN_EMAIL}`,
    ].join('\n');

    res.json({
      submissionId,
      summary,
      message: emailStatus.join(' / '),
    });
  });
});

app.get('/api/submissions', (req, res) => {
  loadSubmissions((err, submissions) => {
    if (err) {
      console.error('Submissions load error:', err);
      return res.status(500).json({ error: '제출 목록을 불러오지 못했습니다.' });
    }

    res.json({ submissions });
  });
});

app.get('/api/users', (req, res) => {
  loadUsers((err, users) => {
    if (err) {
      console.error('Users load error:', err);
      return res.status(500).json({ error: '회원 목록을 불러오지 못했습니다.' });
    }

    res.json({ users: users.map(sanitizeUser) });
  });
});

app.use((req, res) => {
  res.status(404).send('페이지를 찾을 수 없습니다.');
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
