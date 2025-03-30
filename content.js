// Inject the GUI with CPS, Spell Cycle, and buttons
const guiHTML = `
  <div class="mana-calculator">
    <h3>Mana Calculator</h3>
    <label>CPS: <input type="number" id="cpsInput" min="0" step="0.1"></label>
    <label>Spell Cycle: <input type="text" id="spellCycleInput" placeholder="e.g., 1234"></label>
    <button id="manaStormBtn">Mana Storm: Off</button>
    <button id="transcendenceBtn">Transcendence: Off</button>
    <button id="generalistBtn">Generalist: Off</button>
    <p>Mana Regen: <span id="manaRegen">?</span>/sec</p>
    <p>Mana Cost: <span id="manaCost">?</span>/sec</p>
    <p>Net Mana: <span id="netMana">?</span>/sec</p>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', guiHTML);

// State for button toggles
let manaStormActive = false;
let transcendenceActive = false;
let generalistActive = false;

// Toggle button handlers
document.getElementById('manaStormBtn').addEventListener('click', () => {
  manaStormActive = !manaStormActive;
  document.getElementById('manaStormBtn').textContent = `Mana Storm: ${manaStormActive ? 'On' : 'Off'}`;
  updateManaCalc();
});

document.getElementById('transcendenceBtn').addEventListener('click', () => {
  transcendenceActive = !transcendenceActive;
  document.getElementById('transcendenceBtn').textContent = `Transcendence: ${transcendenceActive ? 'On' : 'Off'}`;
  updateManaCalc();
});

document.getElementById('generalistBtn').addEventListener('click', () => {
  generalistActive = !generalistActive;
  document.getElementById('generalistBtn').textContent = `Generalist: ${generalistActive ? 'On' : 'Off'}`;
  updateManaCalc();
});

// Function to scrape mana regen and spell costs from WynnBuilder
function getManaStats() {
  let manaRegenPerSec = 0;
  const rows = document.querySelectorAll('#summary-stats .row');
  for (const row of rows) {
    const label = row.querySelector('.col.text-start');
    if (label && label.textContent.trim() === 'Mana Regen:') {
      const valueElement = row.querySelector('.col.text-end');
      if (valueElement) {
        const rawText = valueElement.textContent.trim();
        console.log(`Mana regen raw: "${rawText}"`);
        if (rawText.includes('/5s')) {
          const manaValue = parseFloat(rawText.split('/')[0]) || 0;
          manaRegenPerSec = manaValue / 5;
        } else {
          manaRegenPerSec = parseFloat(rawText) || 0;
        }
      }
      break;
    }
  }

  const spellCostElements = [
    document.querySelector("#spell1-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell2-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell3-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell4-infoAvg > div > b > span.Mana")
  ];
  const spellCosts = spellCostElements.map(el => {
    const rawValue = el ? el.textContent.trim() : "0";
    const numericValue = parseFloat(rawValue) || 0;
    console.log(`Spell cost raw: "${rawValue}", parsed: ${numericValue}`);
    return numericValue;
  });

  console.log('Spell Costs Array:', spellCosts); // Debug spell costs
  return { manaRegenPerSec, spellCosts };
}

// Update the GUI
function updateManaCalc() {
  const { manaRegenPerSec: baseManaRegen, spellCosts } = getManaStats();
  const cps = parseFloat(document.getElementById('cpsInput').value) || 0;
  const spellCycle = document.getElementById('spellCycleInput').value || "";

  console.log('CPS:', cps, 'Spell Cycle:', spellCycle); // Debug inputs

  let totalManaCost = 0;
  let manaCostPerSec = 0;
  let adjustedManaRegen = baseManaRegen;

  if (spellCycle && cps > 0) {
    const cycleArray = spellCycle.split('').map(Number);
    console.log('Cycle Array:', cycleArray); // Debug cycle parsing
    let lastSpell = null;

    totalManaCost = cycleArray.reduce((sum, spellNum, index) => {
      const spellIndex = spellNum - 1;
      const baseCost = spellCosts[spellIndex] || 0;
      let currentCost = baseCost;

      // Apply repeat penalty
      if (spellNum === lastSpell) {
        currentCost += 5; // Repeat penalty capped at +5
      }

      // Generalist: If first two are different, third costs 1
      if (generalistActive && index === 2 && cycleArray[0] !== cycleArray[1]) {
        currentCost = 1;
      }

      lastSpell = spellNum;
      console.log(`Spell ${spellNum} (index ${index}): Base=${baseCost}, Cost=${currentCost}`);
      return sum + currentCost;
    }, 0);

    console.log('Total Mana Cost before adjustments:', totalManaCost); // Debug before Transcendence

    // Transcendence: Set total mana cost to 70% of original
    if (transcendenceActive) {
      totalManaCost *= 0.7; // 70% of original cost (30% reduction)
      console.log('Total Mana Cost after Transcendence:', totalManaCost); // Debug after Transcendence
    }

    // Mana Storm: Add 5 mana regen per spell in cycle
    if (manaStormActive) {
      adjustedManaRegen += cycleArray.length * 5;
    }

    const totalClicks = cycleArray.length * 3;
    const cycleDuration = totalClicks / cps;
    manaCostPerSec = cycleDuration > 0 ? totalManaCost / cycleDuration : 0;
    console.log('Cycle Duration:', cycleDuration, 'Mana Cost Per Sec:', manaCostPerSec); // Debug final calc
  }

  const netMana = adjustedManaRegen - manaCostPerSec;

  // Update display
  document.getElementById('manaRegen').textContent = adjustedManaRegen.toFixed(1);
  document.getElementById('manaCost').textContent = manaCostPerSec.toFixed(1);
  document.getElementById('netMana').textContent = netMana.toFixed(1);
}

// Initial update
updateManaCalc();

// Update when user changes CPS or Spell Cycle
document.getElementById('cpsInput').addEventListener('input', updateManaCalc);
document.getElementById('spellCycleInput').addEventListener('input', updateManaCalc);

// Re-run update if the page content changes
const observer = new MutationObserver(updateManaCalc);
observer.observe(document.body, { childList: true, subtree: true });