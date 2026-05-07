const sellTab = document.getElementById("sellTab");
const buyTab = document.getElementById("buyTab");
const priceLabel = document.getElementById("priceLabel");
const signupForm = document.getElementById("signupForm");
const signupStatus = document.getElementById("signupStatus");
const dealForm = document.getElementById("dealForm");
const resultSection = document.getElementById("resultSection");
const resultStatus = document.getElementById("resultStatus");
const resultText = document.getElementById("resultText");
const copyButton = document.getElementById("copyButton");
const mailtoLink = document.getElementById("mailtoLink");

let currentMode = "sell";

function setMode(mode) {
  currentMode = mode;
  sellTab.classList.toggle("active", mode === "sell");
  buyTab.classList.toggle("active", mode === "buy");
  sellTab.setAttribute("aria-selected", mode === "sell");
  buyTab.setAttribute("aria-selected", mode === "buy");
  priceLabel.textContent = mode === "sell" ? "매각 희망가 [억원]" : "인수 희망가 [억원]";
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (input) => input.value
  );
}

function buildSummary(values) {
  return [`${values.mode === "sell" ? "매각 희망" : "인수 희망"} 접수 정보`,
    `네이버 검색제휴 여부: ${values.searchAffiliation}`,
    `매체 유형: ${values.mediaTypes.length ? values.mediaTypes.join(", ") : "선택 없음"}`,
    `2025년도 매출: ${values.revenueRange}`,
    `${values.mode === "sell" ? "매각 희망가" : "인수 희망가"}: ${values.price}억원`,
    `하고 싶은 말: ${values.notes || "없음"}`,
    `이메일: ${values.email}`].join("\n");
}

function createMailtoHref(values, summary) {
  const subject = encodeURIComponent(`${values.mode === "sell" ? "매각" : "인수"} 희망 정보 접수`);
  const body = encodeURIComponent(`${summary}\n\n※ 중개 담당자에게 제공할 정보입니다.`);
  return `mailto:?subject=${subject}&body=${body}`;
}

async function readApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return {
      error: "서버 응답이 비어 있습니다. 서버가 실행 중인지 확인해 주세요.",
    };
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      error: "서버에서 올바른 JSON 응답을 받지 못했습니다. npm start로 백엔드 서버를 실행한 뒤 다시 시도해 주세요.",
    };
  }
}

sellTab.addEventListener("click", () => setMode("sell"));
buyTab.addEventListener("click", () => setMode("buy"));

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = signupForm.elements["name"].value.trim();
  const email = signupForm.elements["email"].value.trim();
  const password = signupForm.elements["password"].value;

  if (!name || !email || !password) {
    signupStatus.textContent = "이름, 이메일, 비밀번호를 모두 입력해 주세요.";
    signupStatus.className = "form-status error";
    return;
  }

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

    signupStatus.textContent = data.message;
    signupStatus.className = "form-status success";
    signupForm.reset();
  } catch (error) {
    signupStatus.textContent = error.message;
    signupStatus.className = "form-status error";
  }
});

dealForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchAffiliation = document.querySelector("input[name='searchAffiliation']:checked").value;
  const mediaTypes = getCheckedValues("mediaType");
  const revenueRange = dealForm.elements["revenueRange"].value;
  const price = dealForm.elements["price"].value.trim();
  const notes = dealForm.elements["notes"].value.trim();
  const email = dealForm.elements["email"].value.trim();

  if (!revenueRange || !price || !email) {
    alert("필수 항목을 모두 입력해 주세요.");
    return;
  }

  if (mediaTypes.length === 0) {
    if (!confirm("매체 유형이 선택되지 않았습니다. 계속하시겠습니까?")) {
      return;
    }
  }

  const values = {
    mode: currentMode,
    searchAffiliation,
    mediaTypes,
    revenueRange,
    price,
    notes,
    email,
  };

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    const data = await readApiResponse(response);

    if (!response.ok) {
      throw new Error(data.error || '서버에 요청하는 중 오류가 발생했습니다.');
    }

    resultText.textContent = data.summary;
    resultStatus.textContent = data.message;
    mailtoLink.href = createMailtoHref(values, data.summary);
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    alert(error.message);
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultText.textContent);
    copyButton.textContent = "복사 완료";
    setTimeout(() => {
      copyButton.textContent = "요약 복사";
    }, 1500);
  } catch (err) {
    alert("클립보드 복사가 지원되지 않습니다.");
  }
});

setMode("sell");
