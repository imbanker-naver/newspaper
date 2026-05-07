const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const signupForm = document.getElementById('signupForm');
const signupStatus = document.getElementById('signupStatus');

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = `form-status ${type}`;
}

async function getUserRole(uid) {
  const userDoc = await db.collection('users').doc(uid).get();
  return userDoc.exists ? userDoc.data().role || 'user' : 'user';
}

function redirectByRole(role) {
  window.location.href = role === 'admin' ? 'admin.html' : 'deal.html';
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  try {
    const role = await getUserRole(user.uid);
    redirectByRole(role);
  } catch (error) {
    setStatus(loginStatus, '사용자 정보를 확인하지 못했습니다.', 'error');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = loginForm.elements.email.value.trim();
  const password = loginForm.elements.password.value;

  try {
    const credential = await auth.signInWithEmailAndPassword(email, password);
    const role = await getUserRole(credential.user.uid);
    setStatus(loginStatus, '로그인이 완료되었습니다.', 'success');
    redirectByRole(role);
  } catch (error) {
    setStatus(loginStatus, '이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = signupForm.elements.name.value.trim();
  const email = signupForm.elements.email.value.trim();
  const password = signupForm.elements.password.value;

  if (!name || !email || !password) {
    setStatus(signupStatus, '이름, 이메일, 비밀번호를 모두 입력해 주세요.', 'error');
    return;
  }

  try {
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    await db.collection('users').doc(credential.user.uid).set({
      created_at: new Date().toISOString(),
      name,
      email,
      role,
    });

    setStatus(signupStatus, '회원가입이 완료되었습니다.', 'success');
    redirectByRole(role);
  } catch (error) {
    setStatus(signupStatus, error.code === 'auth/email-already-in-use' ? '이미 가입된 이메일입니다.' : '회원가입 중 오류가 발생했습니다.', 'error');
  }
});
