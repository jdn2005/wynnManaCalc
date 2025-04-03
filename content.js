// Inject the GUI with CPS, Spell Cycle, and buttons
const guiHTML = `
  <div class="mana-calculator">
    <h3>Mana Calculator</h3>
    <label>CPS: <input type="number" id="cpsInput" min="0" step="0.1"></label>
    <label>Spell Cycle: <input type="text" id="spellCycleInput" placeholder="e.g., 1234"></label>
    <div id="toggleButtons">
      <button id="manaStormBtn">Mana Storm: Off</button>
      <button id="transcendenceBtn">Transcendence: Off</button>
      <button id="generalistBtn">Generalist: Off</button>
      <button id="invigoratingWaveBtn">Invigorating Wave: Off</button>
      <button id="weightlessBtn">Weightless: Off</button>
      <button id="sunflareBtn">Sunflare: Off</button>
      <button id="wellOfPowerBtn">Well of Power: Off</button>
    </div>
    <div id="totemControls" style="display: none;">
      <p>Totem (<span id="totemCount">1</span>):</p>
      <input type="range" id="totemSlider" min="1" max="4" value="1">
      <label>CPS: <input type="number" id="totemCpsInput" min="0" step="0.1" value="0"></label>
      <button id="reboundBtn">Rebound: Off</button>
    </div>
    <div id="hitsControls" style="display: none;">
      <p>Hits (<span id="hitsCount">0</span>):</p>
      <input type="range" id="hitsSlider" min="0" max="20" value="0">
    </div>
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
let invigoratingWaveActive = false;
let reboundActive = false;
let weightlessActive = false;
let sunflareActive = false;
let wellOfPowerActive = false;

// Reference to the GUI element
const calculator = document.querySelector('.mana-calculator');

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

document.getElementById('invigoratingWaveBtn').addEventListener('click', () => {
  invigoratingWaveActive = !invigoratingWaveActive;
  document.getElementById('invigoratingWaveBtn').textContent = `Invigorating Wave: ${invigoratingWaveActive ? 'On' : 'Off'}`;
  document.getElementById('totemControls').style.display = invigoratingWaveActive ? 'block' : 'none';
  if (!invigoratingWaveActive) {
    reboundActive = false;
    document.getElementById('reboundBtn').textContent = 'Rebound: Off';
  }
  updateManaCalc();
});

document.getElementById('reboundBtn').addEventListener('click', () => {
  if (invigoratingWaveActive) {
    reboundActive = !reboundActive;
    document.getElementById('reboundBtn').textContent = `Rebound: ${reboundActive ? 'On' : 'Off'}`;
    updateManaCalc();
  }
});

document.getElementById('totemSlider').addEventListener('input', () => {
  const totemCount = document.getElementById('totemSlider').value;
  document.getElementById('totemCount').textContent = totemCount;
  updateManaCalc();
});

document.getElementById('totemCpsInput').addEventListener('input', updateManaCalc);

document.getElementById('weightlessBtn').addEventListener('click', () => {
  weightlessActive = !weightlessActive;
  document.getElementById('weightlessBtn').textContent = `Weightless: ${weightlessActive ? 'On' : 'Off'}`;
  document.getElementById('hitsControls').style.display = weightlessActive ? 'block' : 'none';
  updateManaCalc();
});

document.getElementById('hitsSlider').addEventListener('input', () => {
  const hitsCount = document.getElementById('hitsSlider').value;
  document.getElementById('hitsCount').textContent = hitsCount;
  updateManaCalc();
});

document.getElementById('sunflareBtn').addEventListener('click', () => {
  sunflareActive = !sunflareActive;
  document.getElementById('sunflareBtn').textContent = `Sunflare: ${sunflareActive ? 'On' : 'Off'}`;
  updateManaCalc();
});

document.getElementById('wellOfPowerBtn').addEventListener('click', () => {
  wellOfPowerActive = !wellOfPowerActive;
  document.getElementById('wellOfPowerBtn').textContent = `Well of Power: ${wellOfPowerActive ? 'On' : 'Off'}`;
  updateManaCalc();
});

document.getElementById('cpsInput').addEventListener('input', updateManaCalc);
document.getElementById('spellCycleInput').addEventListener('input', updateManaCalc);

// Dragging functionality
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;

calculator.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'H3') {
    isDragging = true;
    initialX = e.clientX - currentX;
    initialY = e.clientY - currentY;
    calculator.style.cursor = 'grabbing';
    console.log('Dragging started');
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    calculator.style.left = `${currentX}px`;
    calculator.style.top = `${currentY}px`;
    calculator.style.bottom = 'auto';
    calculator.style.right = 'auto';
    console.log(`Dragging to: (${currentX}, ${currentY})`);
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    calculator.style.cursor = 'grab';
    console.log('Dragging stopped');
  }
});

// Initialize position
currentX = window.innerWidth - calculator.offsetWidth - 10;
currentY = window.innerHeight - calculator.offsetHeight - 10;
calculator.style.left = `${currentX}px`;
calculator.style.top = `${currentY}px`;

// Function to map int-skp-pct to desired output (linear)
function mapIntSkpPct(pct) {
  return 3 * pct; // Linear: 0% -> 0, 50% -> 150
}

// Function to scrape mana regen, spell costs, and mana pool from WynnBuilder
function getManaStats() {
  let manaRegenPerSec = 0;
  const rows = document.querySelectorAll('#summary-stats .row');
  for (const row of rows) {
    const label = row.querySelector('.col.text-start');
    if (label && label.textContent.trim() === 'Mana Regen:') {
      const valueElement = row.querySelector('.col.text-end');
      if (valueElement) {
        const rawText = valueElement.textContent.trim();
        console.log(`Mana regen raw from page: "${rawText}"`);
        if (rawText.includes('/5s')) {
          const manaValue = parseFloat(rawText.split('/')[0]) || 0;
          manaRegenPerSec = manaValue / 5;
        } else {
          manaRegenPerSec = parseFloat(rawText) || 0;
        }
      } else {
        console.warn('Mana regen value element not found');
      }
      break;
    }
  }

  // Always apply base 25/5 mana regen (5 mana/sec)
  manaRegenPerSec += 5; // 25/5 = 5 mana/sec
  console.log('Base 25/5 mana regen applied, total mana regen now:', manaRegenPerSec);

  const spellCostElements = [
    document.querySelector("#spell1-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell2-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell3-infoAvg > div > b > span.Mana"),
    document.querySelector("#spell4-infoAvg > div > b > span.Mana")
  ];
  const spellCosts = spellCostElements.map((el, index) => {
    if (!el) {
      console.warn(`Spell ${index + 1} cost element not found`);
      return 0;
    }
    const rawValue = el.textContent.trim();
    const numericValue = parseFloat(rawValue) || 0;
    console.log(`Spell ${index + 1} cost raw: "${rawValue}", parsed: ${numericValue}`);
    return numericValue;
  });

  // Default total mana pool (used for Sunflare and elsewhere)
  let totalManaPool = 100;
  try {
    const maxManaLabelNode = document.evaluate('//*[@id="detailed-stats"]/div[12]/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (maxManaLabelNode && maxManaLabelNode.textContent.trim() === 'Max Mana') {
      const maxManaValueNode = document.evaluate('//*[@id="detailed-stats"]/div[12]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (maxManaValueNode) {
        const rawMaxMana = maxManaValueNode.textContent.trim();
        console.log(`Max Mana raw (div[12]): "${rawMaxMana}"`);
        totalManaPool = parseFloat(rawMaxMana) || 100;
      } else {
        console.warn('Max Mana value element (div[12]) not found, defaulting to 100');
      }
    } else {
      console.warn(`Max Mana label not found at //*[@id="detailed-stats"]/div[12]/div[1] or text is "${maxManaLabelNode?.textContent.trim()}", defaulting to 100`);
    }
  } catch (e) {
    console.error('Error evaluating Max Mana XPath (div[12]):', e);
    totalManaPool = 100;
  }

  console.log('Mana Regen Per Sec:', manaRegenPerSec);
  console.log('Spell Costs Array:', spellCosts);
  console.log('Total Mana Pool:', totalManaPool);
  return { manaRegenPerSec, spellCosts, totalManaPool };
}

// Update the GUI
function updateManaCalc() {
  const { manaRegenPerSec: baseManaRegen, spellCosts, totalManaPool } = getManaStats();
  const cps = parseFloat(document.getElementById('cpsInput').value) || 0;
  const spellCycle = document.getElementById('spellCycleInput').value || "";

  console.log('CPS:', cps, 'Spell Cycle:', spellCycle);

  let totalManaCost = 0;
  let manaCostPerSec = 0;
  let adjustedManaRegen = baseManaRegen;

  if (spellCycle && cps > 0) {
    const cycleArray = spellCycle.split('').map(Number);
    console.log('Cycle Array:', cycleArray);
    let lastSpell = null;

    totalManaCost = cycleArray.reduce((sum, spellNum, index) => {
      const spellIndex = spellNum - 1;
      const baseCost = spellCosts[spellIndex] || 0;
      let currentCost = baseCost;

      if (spellNum === lastSpell) {
        currentCost += 5;
      }

      if (generalistActive && index === 2 && cycleArray[0] !== cycleArray[1]) {
        currentCost = 1;
      }

      lastSpell = spellNum;
      console.log(`Spell ${spellNum} (index ${index}): Base=${baseCost}, Cost=${currentCost}`);
      return sum + currentCost;
    }, 0);

    console.log('Total Mana Cost before adjustments:', totalManaCost);

    if (transcendenceActive) {
      totalManaCost *= 0.7;
      console.log('Total Mana Cost after Transcendence:', totalManaCost);
    }

    if (manaStormActive) {
      adjustedManaRegen += cycleArray.length * 5;
    }

    const totalClicks = cycleArray.length * 3;
    const cycleDuration = totalClicks / cps;
    manaCostPerSec = cycleDuration > 0 ? totalManaCost / cycleDuration : 0;
    console.log('Cycle Duration:', cycleDuration, 'Mana Cost Per Sec:', manaCostPerSec);
  }

  // Invigorating Wave
  if (invigoratingWaveActive) {
    const totemCount = parseInt(document.getElementById('totemSlider').value) || 1;
    const totemCps = parseFloat(document.getElementById('totemCpsInput').value) || 0;
    const manaPerTotemBase = reboundActive ? 6 : 3;
    const manaPerTotemCps = reboundActive ? 2 : 1;
    const cpsMana = (totemCps / 3) * totemCount * manaPerTotemCps;
    adjustedManaRegen += totemCount * manaPerTotemBase + cpsMana;
    console.log(`Invigorating Wave: ${totemCount} totems, Base=${manaPerTotemBase} mana each, CPS=${totemCps}, CPS Mana=${cpsMana.toFixed(2)}, Total +${(totemCount * manaPerTotemBase + cpsMana).toFixed(2)}`);
  }

  // Weightless
  if (weightlessActive) {
    const hitsCount = parseInt(document.getElementById('hitsSlider').value) || 0;
    const manaPerHit = 1.2;
    adjustedManaRegen += hitsCount * manaPerHit;
    console.log(`Weightless: ${hitsCount} hits, ${manaPerHit} mana each, total +${hitsCount * manaPerHit}`);
  }

    // Sunflare
  if (sunflareActive) {
    let sunflareManaPool = 100; // Base mana pool
    let intSkp = 0; // Default value for int-skp

    // Extract int-skp from input
    try {
      const intSkpNode = document.evaluate('//*[@id="int-skp"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (intSkpNode) {
        const rawIntSkp = intSkpNode.tagName.toLowerCase() === 'input' ? intSkpNode.value.trim() : intSkpNode.textContent.trim();
        console.log(`int-skp raw: "${rawIntSkp}"`);
        intSkp = parseFloat(rawIntSkp.match(/\d+(\.\d+)?/)?.[0]) || 0;
        console.log(`int-skp parsed value: ${intSkp}`);
      } else {
        console.warn('int-skp element not found at //*[@id="int-skp"]');
      }
    } catch (e) {
      console.error('Error evaluating int-skp XPath:', e);
    }

    // Exact mapping function
    function mapIntToPercent(int) {
      const intMap = {
        1: 1.0, 2: 2.0, 3: 2.9, 4: 3.9, 5: 4.9, 6: 5.8, 7: 6.7, 8: 7.7, 9: 8.6, 10: 9.5, 11: 10.4, 12: 11.3, 13: 12.2, 14: 13.1, 15: 13.9, 16: 14.8, 17: 15.7, 18: 16.5,
        19: 17.3, 20: 18.2, 21: 19.0, 22: 19.8, 23: 20.6, 24: 21.4, 25: 22.2, 26: 23.0, 27: 23.8, 28: 24.6, 29: 25.3, 30: 26.1, 31: 26.8, 32: 27.6, 33: 28.3, 34: 29,
        35: 29.8, 36: 30.5, 37: 31.2, 38: 31.9, 39: 32.6, 40: 33.3, 41: 34, 42: 34.6, 43: 35.3, 44: 36, 45: 36.6, 46: 37.3, 47: 37.9, 48: 38.6, 49: 39.2, 50: 39.9,
        51: 40.5, 52: 41.1, 53: 41.7, 54: 42.3, 55: 42.9, 56: 43.5, 57: 44.1, 58: 44.7, 59: 45.3, 60: 45.8, 61: 46.4, 62: 47, 63: 47.5, 64: 48.1, 65: 48.6, 66: 49.2,
        67: 49.7, 68: 50.3, 69: 50.8, 70: 51.3, 71: 51.8, 72: 52.3, 73: 52.8, 74: 53.4, 75: 53.9, 76: 54.3, 77: 54.8, 78: 55.3, 79: 55.8, 80: 56.3, 81: 56.8, 82: 57.2,
        83: 57.7, 84: 58.1, 85: 58.6, 86: 59.1, 87: 59.5, 88: 59.9, 89: 60.4, 90: 60.8, 91: 61.3, 92: 61.7, 93: 62.1, 94: 62.5, 95: 62.9, 96: 63.3, 97: 63.8, 98: 64.2,
        99: 64.6, 100: 65, 101: 65.4, 102: 65.7, 103: 66.1, 104: 66.5, 105: 66.9, 106: 67.3, 107: 67.6, 108: 68, 109: 68.4, 110: 68.7, 111: 69.1, 112: 69.4, 113: 69.8,
        114: 70.1, 115: 70.5, 116: 70.8, 117: 71.2, 118: 71.5, 119: 71.8, 120: 72.2, 121: 72.5, 122: 72.8, 123: 73.1, 124: 73.5, 125: 73.8, 126: 74.1, 127: 74.4, 128: 74.7,
        129: 75, 130: 75.3, 131: 75.6, 132: 75.9, 133: 76.2, 134: 76.5, 135: 76.8, 136: 77.1, 137: 77.3, 138: 77.6, 139: 77.9, 140: 78.2, 141: 78.4, 142: 78.7, 143: 79, 144: 79.2,
        145: 79.5, 146: 79.8, 147: 80, 148: 80.3, 149: 80.5, 150: 80.8
        // THERE WERE NO BETTER WAY TO DO THIS 
      };
      if (int <= 0) return 0;
      if (intMap[int]) return intMap[int];
      if (int > 150) return 80.8 + (int - 150) * 0.8;
      const lower = Math.floor(int);
      const upper = Math.ceil(int);
      const lowerVal = intMap[lower] || 0;
      const upperVal = intMap[upper] || (27.6 + (upper - 32) * 0.8);
      return lowerVal + (upperVal - lowerVal) * (int - lower);
    }

    const intSkpPercent = mapIntToPercent(intSkp);
    const intSkpManaContribution = intSkpPercent;
    sunflareManaPool += intSkpManaContribution;
    console.log(`Sunflare: int-skp=${intSkp}, percent=${intSkpPercent.toFixed(1)}%`);

    try {
      const sunflareMaxManaLabelNode = document.evaluate('//*[@id="detailed-stats"]/div[13]/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (sunflareMaxManaLabelNode && sunflareMaxManaLabelNode.textContent.trim() === 'Max Mana') {
        const sunflareMaxManaValueNode = document.evaluate('//*[@id="detailed-stats"]/div[13]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (sunflareMaxManaValueNode) {
          const rawSunflareMaxMana = sunflareMaxManaValueNode.textContent.trim();
          console.log(`Sunflare Max Mana raw (div[13]): "${rawSunflareMaxMana}"`);
          const additionalMana = parseFloat(rawSunflareMaxMana) || 0;
          sunflareManaPool = additionalMana > 0 ? additionalMana : sunflareManaPool;
        }
      }
    } catch (e) {
      console.error('Error evaluating Sunflare Max Mana XPath (div[13]):', e);
    }

    const sunflareMana = sunflareManaPool * 0.05;
    adjustedManaRegen += sunflareMana;
    console.log(`Sunflare: Total Mana Pool=${sunflareManaPool.toFixed(1)}, Regen=+${sunflareMana.toFixed(2)} mana/sec`);
  }
    // Well of Power - adds 3 mana regen per second
  if (wellOfPowerActive) {
    adjustedManaRegen += 3;
    console.log('Well of Power: +3 mana/sec');
  }

  const netMana = adjustedManaRegen - manaCostPerSec;

  console.log('Adjusted Mana Regen:', adjustedManaRegen, 'Mana Cost Per Sec:', manaCostPerSec, 'Net Mana:', netMana);

  // Update display
  document.getElementById('manaRegen').textContent = adjustedManaRegen.toFixed(1);
  document.getElementById('manaCost').textContent = manaCostPerSec.toFixed(1);
  document.getElementById('netMana').textContent = netMana.toFixed(1);
}

// Wait for page load and initialize mana calculator
window.addEventListener('load', () => {
  console.log('Page loaded, initializing mana calculator');
  updateManaCalc();
});

// Re-run update if the page content changes (only for mana calc)
const observer = new MutationObserver(() => {
  console.log('DOM changed, updating mana calc');
  updateManaCalc();
});
observer.observe(document.body, { childList: true, subtree: true });