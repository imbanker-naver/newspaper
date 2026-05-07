const sellTab = document.getElementById("sellTab");
const buyTab = document.getElementById("buyTab");
const priceLabel = document.getElementById("priceLabel");
const logoutButton = document.getElementById("logoutButton");
const dealForm = document.getElementById("dealForm");
const resultSection = document.getElementById("resultSection");
const resultStatus = document.getElementById("resultStatus");
const resultText = document.getElementById("resultText");
const copyButton = document.getElementById("copyButton");

let currentMode = "sell";
let currentUser = null;

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

sellTab.addEventListener("click", () => setMode("sell"));
buyTab.addEventListener("click", () => setMode("buy"));

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  dealForm.elements["email"].value = user.email || "";
  dealForm.elements["email"].readOnly = true;
});

logoutButton.addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = 'index.html';
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
    if (!currentUser) {
      window.location.href = 'index.html';
      return;
    }

    const summary = buildSummary(values);

    await db.collection('submissions').add({
      created_at: new Date().toISOString(),
      userId: currentUser.uid,
      ...values,
    });

    resultText.textContent = summary;
    resultStatus.textContent = "접수가 완료되었습니다.";
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
