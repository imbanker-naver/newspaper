const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const signupForm = document.getElementById('signupForm');
const signupStatus = document.getElementById('signupStatus');

async function readApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return { error: '서버 응답이 비어 있습니다. 서버가 실행 중인지 확인해 주세요.' };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: '서버에서 올바른 응답을 받지 못했습니다.' };
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = loginForm.elements.email.value.trim();
  const password = loginForm.elements.password.value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(data.error || '로그인 중 오류가 발생했습니다.');
    }

    loginStatus.textContent = data.message;
    loginStatus.className = 'form-status success';
    window.location.href = data.redirectTo || '/index.html';
  } catch (error) {
    loginStatus.textContent = error.message;
    loginStatus.className = 'form-status error';
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = signupForm.elements.name.value.trim();
  const email = signupForm.elements.email.value.trim();
  const password = signupForm.elements.password.value;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(data.error || '회원가입 중 오류가 발생했습니다.');
    }

    signupStatus.textContent = `${data.message} 가입한 이메일로 로그인해 주세요.`;
    signupStatus.className = 'form-status success';
    loginForm.elements.email.value = email;
    signupForm.reset();
  } catch (error) {
    signupStatus.textContent = error.message;
    signupStatus.className = 'form-status error';
  }
});
