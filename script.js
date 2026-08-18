const welcomePage = document.getElementById("welcomePage");
const racePage = document.getElementById("racePage");

const playerNameInput = document.getElementById("playerName");
const enterButton = document.getElementById("enterButton");

const raceButtons = document.querySelectorAll(".race-button");
const confirmRaceButton = document.getElementById("confirmRaceButton");

let selectedRace = null;

const raceData = {
  human: {
    name: "انسان"
  },
  dwarf: {
    name: "دروف"
  },
  dragon: {
    name: "نیمه دراگون"
  },
  halfHuman: {
    name: "نیمه انسان"
  },
  angel: {
    name: "فرشته"
  },
  elf: {
    name: "الف"
  }
};

// بررسی نام و نژاد ذخیره‌شده
const savedName = localStorage.getItem("playerName");
const savedRace = localStorage.getItem("selectedRace");

if (savedName && savedRace) {
  showRacePage();
}

// فعال شدن دکمه ورود
playerNameInput.addEventListener("input", () => {
  enterButton.disabled = playerNameInput.value.trim().length < 2;
});

// ثبت نام و رفتن به انتخاب نژاد
enterButton.addEventListener("click", () => {
  const name = playerNameInput.value.trim();

  if (name.length < 2) {
    alert("لطفاً نام خود را وارد کنید.");
    return;
  }

  if (!localStorage.getItem("playerName")) {
    localStorage.setItem("playerName", name);
  }

  showRacePage();
});

function showRacePage() {
  welcomePage.classList.add("hidden");
  racePage.classList.remove("hidden");
}

// انتخاب نژاد
raceButtons.forEach(button => {
  button.addEventListener("click", () => {
    const raceKey = button.dataset.race;
    selectedRace = raceKey;

    raceButtons.forEach(item => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
    confirmRaceButton.disabled = false;
  });
});

// تأیید نژاد
confirmRaceButton.addEventListener("click", () => {
  if (!selectedRace) {
    alert("لطفاً ابتدا یک نژاد انتخاب کنید.");
    return;
  }

  localStorage.setItem("selectedRace", selectedRace);

  const selectedRaceName = raceData[selectedRace].name;
  alert(`نژاد ${selectedRaceName} انتخاب شد. ورود به پایتخت...`);

  // مرحله بعدی را بعداً جایگزین می‌کنیم
  // window.location.href = "capital.html";
});
