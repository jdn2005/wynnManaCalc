// Inject the GUI with CPS and Spell Cycle inputs, no defaults
const guiHTML = `
  <div class="mana-calculator">
    <h3>Mana Calculator</h3>
    <label>CPS: <input type="number" id="cpsInput" min="0" step="0.1"></label>
    <label>Spell Cycle: <input type="text" id="spellCycleInput" placeholder="e.g., 1234"></label>
    <p>Mana Regen: <span id="manaRegen">?</span>/sec</p>
    <p>Mana Cost: <span id="manaCost">?</span>/sec</p>
    <p>Net Mana: <span id="netMana">?</span>/sec</p>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', guiHTML);

// Function to scrape mana regen and spell costs from WynnBuilder
function getManaStats() {
  // Scrape mana regen and convert to per-second
  const manaRegenElement = document.querySelector("#summary-stats > div:nth-child(12) > div.col.text-end.positive");
  let manaRegenPerSec = 0;
  if (manaRegenElement && manaRegenElement.textContent.includes('/5s')) {
    const manaValue = parseFloat(manaRegenElement.textContent.split('/')[0]) || 0;
    manaRegenPerSec = manaValue / 5; // Convert to per-sec
  }

  // Scrape spell costs with decimals
  const spellCostElements = [
    document.querySelector("#spell1-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell2-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell3-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell4-infoAvg > div > b > span.Mana")
  ];
  const spellCosts = spellCostElements.map(el => {
    const rawValue = el ? el.textContent.trim() : "0";
    const numericValue = parseFloat(rawValue) || 0; // Ensure decimals are captured
    console.log(`Spell cost raw: "${rawValue}", parsed: ${numericValue}`); // Debug output
    return numericValue;
  });

  return { manaRegenPerSec, spellCosts };
}

// Update the GUI
function updateManaCalc() {
  const { manaRegenPerSec, spellCosts } = getManaStats();
  const cps = parseFloat(document.getElementById('cpsInput').value) || 0;
  const spellCycle = document.getElementById('spellCycleInput').value || "";

  // Calculate mana cost with repeat penalty capped at +5
  let totalManaCost = 0;
  let manaCostPerSec = 0;
  if (spellCycle && cps > 0) {
    const cycleArray = spellCycle.split('').map(Number); // Convert string to array of numbers
    let lastSpell = null;

    totalManaCost = cycleArray.reduce((sum, spellNum) => {
      const spellIndex = spellNum - 1; // Convert to 0-based index
      const baseCost = spellCosts[spellIndex] || 0;

      // Apply repeat penalty: +5 on second and subsequent repeats, no further increase
      let currentCost = baseCost;
      if (spellNum === lastSpell) {
        currentCost += 5; // Add 5 mana for any repeat (caps here)
      }
      lastSpell = spellNum;

      console.log(`Spell ${spellNum}: Base=${baseCost}, Cost=${currentCost}`); // Debug
      return sum + currentCost;
    }, 0);

    const totalClicks = cycleArray.length * 3; // Each spell takes 3 clicks
    const cycleDuration = totalClicks / cps; // Time to complete cycle in seconds
    manaCostPerSec = cycleDuration > 0 ? totalManaCost / cycleDuration : 0;
  }

  const netMana = manaRegenPerSec - manaCostPerSec;

  // Update display
  document.getElementById('manaRegen').textContent = manaRegenPerSec.toFixed(1);
  document.getElementById('manaCost').textContent = manaCostPerSec.toFixed(1);
  document.getElementById('netMana').textContent = netMana.toFixed(1);
}

// Initial update
updateManaCalc();

// Update when user changes CPS or Spell Cycle
document.getElementById('cpsInput').addEventListener('input', updateManaCalc);
document.getElementById('spellCycleInput').addEventListener('input', updateManaCalc);

// Re-run update if the page content changes (e.g., new build loaded)
const observer = new MutationObserver(updateManaCalc);
observer.observe(document.body, { childList: true, subtree: true });