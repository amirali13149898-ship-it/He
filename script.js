const welcomePage = document.getElementById("welcomePage");
const racePage = document.getElementById("racePage");
const playerNameInput = document.getElementById("playerName");
const enterButton = document.getElementById("enterButton");

let selectedRace = null;

const raceData = {
  human: "انسان",
  dwarf: "دروف",
  dragon: "نیمه دراگون",
  halfHuman: "نیمه انسان",
  angel: "فرشته",
  elf: "الف"
};

const savedName = localStorage.getItem("playerName");
const savedRace = localStorage.getItem("selectedRace");

if (savedName && savedRace) {
  showRacePage();
}

playerNameInput.addEventListener("input", () => {
  enterButton.disabled = playerNameInput.value.trim().length < 2;
});

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

// کلیک روی نژادها
document.querySelectorAll('area[data-race]').forEach(area => {
  area.addEventListener('click', function(e) {
    e.preventDefault();
    selectedRace = this.dataset.race;
    console.log("نژاد انتخاب شد:", selectedRace);
  });
});

// کلیک روی دکمه تأیید
document.getElementById('confirmArea').addEventListener('click', function(e) {
  e.preventDefault();
  
  if (!selectedRace) {
    alert("لطفاً ابتدا یک نژاد انتخاب کنید.");
    return;
  }

  localStorage.setItem("selectedRace", selectedRace);
  alert(`نژاد ${raceData[selectedRace]} انتخاب شد.\nورود به پایتخت...`);
});
