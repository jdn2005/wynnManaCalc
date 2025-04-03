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

  // Default total mana pool 
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
  console.log('Total Mana Pool (general):', totalManaPool);
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
    let sunflareManaPool = 100; // Default for Sunflare
    try {
      const sunflareMaxManaLabelNode = document.evaluate('//*[@id="detailed-stats"]/div[13]/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (sunflareMaxManaLabelNode && sunflareMaxManaLabelNode.textContent.trim() === 'Max Mana') {
        const sunflareMaxManaValueNode = document.evaluate('//*[@id="detailed-stats"]/div[13]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (sunflareMaxManaValueNode) {
          const rawSunflareMaxMana = sunflareMaxManaValueNode.textContent.trim();
          console.log(`Sunflare Max Mana raw (div[13]): "${rawSunflareMaxMana}"`);
          sunflareManaPool = parseFloat(rawSunflareMaxMana) || 100;
        } else {
          console.warn('Sunflare Max Mana value element (div[13]) not found, defaulting to 100');
        }
      } else {
        console.warn(`Sunflare Max Mana label not found at //*[@id="detailed-stats"]/div[13]/div[1] or text is "${sunflareMaxManaLabelNode?.textContent.trim()}", defaulting to 100`);
      }
    } catch (e) {
      console.error('Error evaluating Sunflare Max Mana XPath (div[13]):', e);
      sunflareManaPool = 100;
    }
    const sunflareMana = sunflareManaPool * 0.05;
    adjustedManaRegen += sunflareMana;
    console.log(`Sunflare: 5% of ${sunflareManaPool} mana pool, +${sunflareMana.toFixed(2)} mana/sec`);
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