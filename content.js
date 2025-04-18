// Check if we're on a valid WynnBuilder page
if (!document.querySelector('#summary-stats')) {
  console.log('Mana Calculator: Not on a valid WynnBuilder page');
} else {
  // Inject the GUI
  const guiHTML = `
    <div class="mana-calculator">
      <h3>Mana Calculator</h3>
      <label>CPS: <input type="number" id="cpsInput" min="0" step="0.1" value="0"></label>
      <label>Spell Cycle: <input type="text" id="spellCycleInput" placeholder="e.g., 1234"></label>
      <div id="toggleButtons">
        <button id="manaStormBtn">Mana Storm: Off</button>
        <button id="transcendenceBtn">Transcendence: Off</button>
        <button id="generalistBtn">Generalist: Off</button>
        <button id="invigoratingWaveBtn">Invigorating Wave: Off</button>
        <button id="weightlessBtn">Weightless: Off</button>
        <button id="sunflareBtn">Sunflare: Off</button>
        <button id="wellOfPowerBtn">Well of Power: Off</button>
        <button id="arcaneTransferBtn">Arcane Transfer: Off</button>
        <button id="bloodPactBtn">Blood Pact: Off</button>
      </div>
      <div id="arcaneTransferControls" style="display: none;">
        <p>Enemies Hit (<span id="enemyHitCount">0</span>):</p>
        <input type="range" id="enemyHitSlider" min="0" max="10" value="0">
        <div id="chaosExplosionControls" style="display: none;">
          <p>Chaos Replication (<span id="chaosReplicationCount">3</span>):</p>
          <input type="range" id="chaosReplicationSlider" min="3" max="7" value="3">
        </div>
        <div class="button-group">
          <button id="thunderstormBtn">Thunderstorm: Off</button>
          <button id="sorceryBtn">Sorcery: Off</button>
          <button id="arcanePowerBtn">Arcane Power: Off</button>
        </div>
        <div id="thunderstormControls" style="display: none;">
          <p>Thunderstorms (<span id="thunderstormCount">3</span>):</p>
          <input type="range" id="thunderstormSlider" min="3" max="6" value="3">
        </div>
      </div>
      <div id="bloodPactControls" style="display: none;">
        <div class="button-group">
          <button id="haemorrhageBtn">Haemorrhage: Off</button>
          <button id="fallenAspectBtn">Fallen Aspect: Off</button>
        </div>
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
      <p id="manaBankContainer" style="display: none;">Mana Bank: <span id="manaBank">0</span></p>
      <p>Mana Regen: <span id="manaRegen">0</span>/sec</p>
      <p>Mana Cost: <span id="manaCost">0</span>/sec</p>
      <p>Net Mana: <span id="netMana">0</span>/sec</p>
      <p id="hpCostContainer" style="display: none;">HP Cost: <span id="hpCost">0</span>/sec</p>
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
  let arcaneTransferActive = false;
  let thunderstormActive = false;
  let arcanePowerActive = false;
  let sorceryActive = false;
  let bloodPactActive = false;
  let haemorrhageActive = false;
  let fallenAspectActive = false;

  // Reference to the GUI element
  const calculator = document.querySelector('.mana-calculator');

  // Button name mapping for proper capitalization
  const buttonNames = {
    manaStormBtn: 'Mana Storm',
    transcendenceBtn: 'Transcendence',
    generalistBtn: 'Generalist',
    invigoratingWaveBtn: 'Invigorating Wave',
    weightlessBtn: 'Weightless',
    sunflareBtn: 'Sunflare',
    wellOfPowerBtn: 'Well of Power',
    arcaneTransferBtn: 'Arcane Transfer',
    thunderstormBtn: 'Thunderstorm',
    arcanePowerBtn: 'Arcane Power',
    sorceryBtn: 'Sorcery',
    reboundBtn: 'Rebound',
    bloodPactBtn: 'Blood Pact',
    haemorrhageBtn: 'Haemorrhage',
    fallenAspectBtn: 'Fallen Aspect'
  };

  // Toggle button handlers
  const setupEventListeners = () => {
    const buttons = [
      { id: 'manaStormBtn', toggle: () => manaStormActive, setToggle: v => manaStormActive = v },
      { id: 'transcendenceBtn', toggle: () => transcendenceActive, setToggle: v => transcendenceActive = v },
      { id: 'generalistBtn', toggle: () => generalistActive, setToggle: v => generalistActive = v },
      { id: 'invigoratingWaveBtn', toggle: () => invigoratingWaveActive, setToggle: v => invigoratingWaveActive = v },
      { id: 'weightlessBtn', toggle: () => weightlessActive, setToggle: v => weightlessActive = v },
      { id: 'sunflareBtn', toggle: () => sunflareActive, setToggle: v => sunflareActive = v },
      { id: 'wellOfPowerBtn', toggle: () => wellOfPowerActive, setToggle: v => wellOfPowerActive = v },
      { id: 'arcaneTransferBtn', toggle: () => arcaneTransferActive, setToggle: v => arcaneTransferActive = v },
      { id: 'thunderstormBtn', toggle: () => thunderstormActive, setToggle: v => thunderstormActive = v },
      { id: 'arcanePowerBtn', toggle: () => arcanePowerActive, setToggle: v => arcanePowerActive = v },
      { id: 'sorceryBtn', toggle: () => sorceryActive, setToggle: v => sorceryActive = v },
      { id: 'reboundBtn', toggle: () => reboundActive, setToggle: v => reboundActive = v },
      { id: 'bloodPactBtn', toggle: () => bloodPactActive, setToggle: v => bloodPactActive = v },
      { id: 'haemorrhageBtn', toggle: () => haemorrhageActive, setToggle: v => haemorrhageActive = v },
      { id: 'fallenAspectBtn', toggle: () => fallenAspectActive, setToggle: v => fallenAspectActive = v },
    ];

    buttons.forEach(({ id, toggle, setToggle }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          try {
            console.log(`Button ${id} clicked. Current state: ${toggle()}`);
            if (id === 'invigoratingWaveBtn') {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              document.getElementById('totemControls').style.display = toggle() ? 'block' : 'none';
              if (!toggle()) {
                reboundActive = false;
                document.getElementById('reboundBtn').textContent = `${buttonNames.reboundBtn}: Off`;
              }
            } else if (id === 'reboundBtn' && invigoratingWaveActive) {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
            } else if (id === 'arcaneTransferBtn') {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              document.getElementById('arcaneTransferControls').style.display = toggle() ? 'block' : 'none';
              document.getElementById('manaBankContainer').style.display = toggle() ? 'block' : 'none';
              if (!toggle()) {
                thunderstormActive = false;
                arcanePowerActive = false;
                sorceryActive = false;
                document.getElementById('thunderstormBtn').textContent = `${buttonNames.thunderstormBtn}: Off`;
                document.getElementById('arcanePowerBtn').textContent = `${buttonNames.arcanePowerBtn}: Off`;
                document.getElementById('sorceryBtn').textContent = `${buttonNames.sorceryBtn}: Off`;
                document.getElementById('thunderstormControls').style.display = 'none';
                document.getElementById('chaosExplosionControls').style.display = 'none';
              }
            } else if (id === 'thunderstormBtn' && arcaneTransferActive) {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              document.getElementById('thunderstormControls').style.display = toggle() ? 'block' : 'none';
              if (toggle()) {
                arcanePowerActive = false;
                document.getElementById('arcanePowerBtn').textContent = `${buttonNames.arcanePowerBtn}: Off`;
                console.log('Thunderstorm activated, Arcane Power disabled');
              }
            } else if (id === 'arcanePowerBtn' && arcaneTransferActive && !thunderstormActive) {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              console.log(`Arcane Power toggled to: ${toggle()}`);
            } else if (id === 'sorceryBtn' && arcaneTransferActive) {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
            } else if (id === 'weightlessBtn') {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              document.getElementById('hitsControls').style.display = toggle() ? 'block' : 'none';
            } else if (id === 'bloodPactBtn') {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              document.getElementById('bloodPactControls').style.display = toggle() ? 'block' : 'none';
              document.getElementById('hpCostContainer').style.display = toggle() ? 'block' : 'none';
              try {
                updateSpellHPCosts(toggle());
              } catch (e) {
                console.error('Error updating spell HP costs on Blood Pact toggle:', e);
              }
              if (!toggle()) {
                haemorrhageActive = false;
                fallenAspectActive = false;
                document.getElementById('haemorrhageBtn').textContent = `${buttonNames.haemorrhageBtn}: Off`;
                document.getElementById('fallenAspectBtn').textContent = `${buttonNames.fallenAspectBtn}: Off`;
              }
            } else if (id === 'haemorrhageBtn' && bloodPactActive) {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              try {
                updateSpellHPCosts(bloodPactActive);
              } catch (e) {
                console.error('Error updating spell HP costs on Haemorrhage toggle:', e);
              }
            } else if (id === 'fallenAspectBtn' && bloodPactActive) {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
              try {
                updateSpellHPCosts(bloodPactActive);
              } catch (e) {
                console.error('Error updating spell HP costs on Fallen Aspect toggle:', e);
              }
            } else {
              setToggle(!toggle());
              btn.textContent = `${buttonNames[id]}: ${toggle() ? 'On' : 'Off'}`;
            }
            updateManaCalc();
          } catch (e) {
            console.error(`Error in ${id} click handler:`, e);
          }
        });
      } else {
        console.warn(`Button #${id} not found`);
      }
    });

    // Slider and input handlers
    const inputs = [
      { id: 'totemSlider', display: 'totemCount' },
      { id: 'hitsSlider', display: 'hitsCount' },
      { id: 'enemyHitSlider', display: 'enemyHitCount' },
      { id: 'thunderstormSlider', display: 'thunderstormCount' },
      { id: 'chaosReplicationSlider', display: 'chaosReplicationCount' },
    ];

    inputs.forEach(({ id, display }) => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener('input', () => {
          try {
            document.getElementById(display).textContent = slider.value;
            updateManaCalc();
          } catch (e) {
            console.error(`Error in ${id} input handler:`, e);
          }
        });
      } else {
        console.warn(`Slider #${id} not found`);
      }
    });

    ['cpsInput', 'totemCpsInput', 'spellCycleInput'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => {
          try {
            updateManaCalc();
          } catch (e) {
            console.error(`Error in ${id} input handler:`, e);
          }
        });
      } else {
        console.warn(`Input #${id} not found`);
      }
    });
  };

  // Dragging functionality
  let isDragging = false;
  let currentX = window.innerWidth - 300 - 10;
  let currentY = window.innerHeight - 400 - 10;
  let initialX, initialY;

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

  calculator.style.left = `${currentX}px`;
  calculator.style.top = `${currentY}px`;

  // Function to map int-skp to percentage
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

  // Scrape mana stats, HP, and spell names from WynnBuilder
  function getManaStats() {
    try {
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
              manaRegenPerSec = (parseFloat(rawText.split('/')[0]) || 0) / 5;
            } else {
              manaRegenPerSec = parseFloat(rawText) || 0;
            }
          }
          break;
        }
      }
      manaRegenPerSec += 5; // Base 25/5 mana regen
      console.log('Mana regen after base:', manaRegenPerSec);

      const spellCostSelectors = [
        '#spell1-infoAvg > div > b > span.Mana',
        '#spell2-infoAvg > div > b > span.Mana',
        '#spell3-infoAvg > div > b > span.Mana',
        '#spell4-infoAvg > div > b > span.Mana'
      ];
      const spellCosts = spellCostSelectors.map((selector, index) => {
        const el = document.querySelector(selector);
        const value = el ? parseFloat(el.textContent.trim()) || 0 : 0;
        console.log(`Spell ${index + 1} cost: ${value}`);
        return value;
      });

      let totalManaPool = 100;
      try {
        const maxManaLabelNode = document.evaluate('//*[@id="detailed-stats"]/div[12]/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (maxManaLabelNode && maxManaLabelNode.textContent.trim().startsWith('Max Mana')) {
          const maxManaValueNode = document.evaluate('//*[@id="detailed-stats"]/div[12]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (maxManaValueNode) {
            totalManaPool += parseFloat(maxManaValueNode.textContent.trim()) || 0;
          }
        }
      } catch (e) {
        console.warn('Error scraping Max Mana:', e);
      }
      console.log('Total Mana Pool:', totalManaPool);

      let totalHP = 1000; // Default HP if scraping fails
      try {
        const hpNode = document.evaluate('/html/body/div[3]/div[2]/div[2]/div/div[3]/div[1]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (hpNode) {
          totalHP = parseFloat(hpNode.textContent.trim()) || 1000;
        }
      } catch (e) {
        console.warn('Error scraping HP:', e);
      }
      console.log('Total HP:', totalHP);

      const spellNameXPaths = [
        '/html/body/div[3]/div[2]/div[3]/div[1]/div[2]/div[1]/div/b/span[1]',
        '/html/body/div[3]/div[2]/div[3]/div[1]/div[3]/div[1]/div/b/span[1]',
        '/html/body/div[3]/div[2]/div[3]/div[1]/div[4]/div[1]/div/b/span[1]',
        '/html/body/div[3]/div[2]/div[3]/div[1]/div[5]/div[1]/div/b/span[1]'
      ];
      const spellNameNodes = spellNameXPaths.map((xpath, index) => {
        try {
          const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          console.log(`Spell ${index + 1} name node:`, node ? node.textContent : 'Not found');
          return node;
        } catch (e) {
          console.warn(`Error scraping spell ${index + 1} name:`, e);
          return null;
        }
      });

      return { manaRegenPerSec, spellCosts, totalManaPool, totalHP, spellNameNodes };
    } catch (e) {
      console.error('Error in getManaStats:', e);
      return { manaRegenPerSec: 5, spellCosts: [0, 0, 0, 0], totalManaPool: 100, totalHP: 1000, spellNameNodes: [null, null, null, null] };
    }
  }

  // Function to update %HP cost display for each spell
  function updateSpellHPCosts(isBloodPactActive) {
    try {
      const { spellCosts, spellNameNodes } = getManaStats();
      let hpPercentPerMana = haemorrhageActive ? 0.25 : 0.35;
      if (fallenAspectActive) {
        hpPercentPerMana -= 0.1;
      }

      spellNameNodes.forEach((node, index) => {
        if (!node || !node.parentElement) {
          console.warn(`Spell ${index + 1} node is null or has no parent`);
          return;
        }

        // Remove existing %HP span if any
        const existingSpan = node.parentElement.querySelector('.hp-cost');
        if (existingSpan) {
          existingSpan.remove();
        }

        if (isBloodPactActive) {
          const manaCost = spellCosts[index] || 0;
          const hpPercent = manaCost * hpPercentPerMana;
          const span = document.createElement('span');
          span.className = 'hp-cost';
          span.textContent = ` (${hpPercent.toFixed(2)}% HP)`;
          node.parentElement.appendChild(span);
          console.log(`Spell ${index + 1} HP cost: ${manaCost} mana * ${hpPercentPerMana}% = ${hpPercent.toFixed(2)}%`);
        }
      });
    } catch (e) {
      console.error('Error in updateSpellHPCosts:', e);
    }
  }

  // Update calculations and GUI
  function updateManaCalc() {
    try {
      console.log('Running updateManaCalc');
      const { manaRegenPerSec: baseManaRegen, spellCosts, totalManaPool, totalHP } = getManaStats();
      const cpsInput = document.getElementById('cpsInput');
      const spellCycleInput = document.getElementById('spellCycleInput');
      if (!cpsInput || !spellCycleInput) {
        console.warn('CPS or Spell Cycle input missing');
        return;
      }

      const cps = parseFloat(cpsInput.value) || 0;
      const spellCycle = spellCycleInput.value.trim();

      let totalManaCost = 0;
      let manaCostPerSec = 0;
      let hpCostPerSec = 0;
      let hpPercentPerSec = 0;
      let adjustedManaRegen = baseManaRegen || 0;
      let manaBank = 0;
      let totalClicks = 0;

      if (spellCycle && cps > 0) {
        let cycleArray = spellCycle.split('').map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 4);
        console.log('Cycle Array:', cycleArray);

        const chaosControls = document.getElementById('chaosExplosionControls');
        if (chaosControls) {
          chaosControls.style.display = cycleArray.includes(1) && arcaneTransferActive ? 'block' : 'none';
        }

        let effectiveCycle = cycleArray;
        let chaosActivations = 0;
        let replicatedSpells = [];
        if (cycleArray.includes(1)) {
          const replicationSlider = document.getElementById('chaosReplicationSlider');
          const replicationCount = replicationSlider ? parseInt(replicationSlider.value) || 3 : 3;
          chaosActivations = cycleArray.filter(spell => spell === 1).length;
          effectiveCycle = cycleArray.filter(spell => spell !== 1);

          const indicesOfOne = cycleArray.reduce((acc, spell, idx) => {
            if (spell === 1) acc.push(idx);
            return acc;
          }, []);
          indicesOfOne.forEach((oneIdx) => {
            let startIdx = Math.max(0, oneIdx - replicationCount);
            let spellsToReplicate = cycleArray.slice(startIdx, oneIdx).filter(spell => spell !== 1);
            replicatedSpells.push(...spellsToReplicate);
          });
          console.log('Chaos Explosion:', { effectiveCycle, chaosActivations, replicatedSpells });
        }

        if (effectiveCycle.length === 0) {
          effectiveCycle = cycleArray;
        }

        let isArcaneTransferArchetype = false;
        if (arcaneTransferActive && spellCycle.includes('1')) {
          try {
            const archetypeNode = document.evaluate(
              '/html/body/div[3]/div[2]/div[3]/div[1]/div[2]/div[1]/div/b/span[1]',
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            isArcaneTransferArchetype = archetypeNode && archetypeNode.textContent.trim() === 'Arcane Transfer';
            console.log('Arcane Transfer archetype:', isArcaneTransferArchetype);
          } catch (e) {
            console.warn('Error checking Arcane Transfer archetype:', e);
          }
        }

        let lastSpell = null;
        let totalManaBank = 0;

        function calculateSpellManaBank(spellNum, cycle) {
          let spellManaBank = 0;
          if (arcaneTransferActive) {
            const enemyHitSlider = document.getElementById('enemyHitSlider');
            const enemyHits = enemyHitSlider ? parseInt(enemyHitSlider.value) || 0 : 0;
            const manaPerHit = arcanePowerActive && (!thunderstormActive || spellNum !== 3) ? 19 : 7;

            if ([2, 3, 4].includes(spellNum)) {
              spellManaBank += enemyHits * manaPerHit;
              console.log(`Spell ${spellNum}: ${enemyHits} hits, ${manaPerHit} mana/hit, Bank +${spellManaBank}`);
            }

            if (spellNum === 3 && thunderstormActive) {
              const thunderstormSlider = document.getElementById('thunderstormSlider');
              const thunderstormCount = thunderstormSlider ? parseInt(thunderstormSlider.value) || 3 : 3;
              const thunderMana = enemyHits * (thunderstormCount * 7);
              spellManaBank += thunderMana;
              console.log(`Spell 3 Thunderstorm: ${enemyHits} enemies, ${thunderstormCount} thunderstorms, 7 mana each, Bank +${thunderMana}`);
            }
          }
          return spellManaBank;
        }

        effectiveCycle.forEach((spellNum, index) => {
          let spellManaBank = calculateSpellManaBank(spellNum, effectiveCycle);
          if (sorceryActive) {
            spellManaBank *= 1.3;
            console.log(`Sorcery: Spell ${spellNum} Bank=${spellManaBank.toFixed(2)}`);
          }
          totalManaBank += spellManaBank;
        });

        if (cycleArray.includes(1) && replicatedSpells.length > 0 && totalManaBank > 120) {
          console.log(`Chaos Explosion: Replicating ${replicatedSpells.length}, draining ${totalManaBank}`);
          totalManaBank = 0;
          replicatedSpells.forEach((spellNum, index) => {
            let spellManaBank = calculateSpellManaBank(spellNum, replicatedSpells);
            if (sorceryActive) {
              spellManaBank *= 1.3;
              console.log(`Sorcery Replicated Spell ${spellNum}: Bank=${spellManaBank.toFixed(2)}`);
            }
            totalManaBank += spellManaBank;
          });
          console.log(`Chaos Explosion Added: ${totalManaBank}`);
        }

        totalManaBank = Math.min(totalManaBank, 150);
        console.log(`Mana Bank Capped: ${totalManaBank}`);
        manaBank = totalManaBank;

        if (cycleArray.includes(1) && chaosActivations > 0) {
          totalClicks = effectiveCycle.length * 3;
          const cycleDuration = cps > 0 ? totalClicks / cps : 0;
          const manaBankPerSec = cycleDuration > 0 ? totalManaBank / cycleDuration : 0;
          adjustedManaRegen += manaBankPerSec * chaosActivations;
          console.log(`Chaos Explosion Regen: ${manaBankPerSec * chaosActivations}`);
        }

        // Track unique spells for Generalist
        const seenSpells = new Set();
        let uniqueSpellCount = 0;

        totalManaCost = cycleArray.reduce((sum, spellNum, index) => {
          const spellIndex = spellNum - 1;
          const baseCost = spellCosts[spellIndex] || 0;
          let currentCost = baseCost;

          // Arcane Transfer: Spell 1 costs 0 if archetype is active
          if (spellNum === 1 && isArcaneTransferArchetype) {
            currentCost = 0;
            console.log(`Spell ${spellNum}: Arcane Transfer, Cost=0`);
          }

          // Repeated spell penalty
          if (spellNum === lastSpell) {
            currentCost += 5;
            console.log(`Spell ${spellNum}: Repeated spell, +5 mana, Cost=${currentCost}`);
          }

          // Generalist: Every third unique spell costs 1 mana
          if (generalistActive && !seenSpells.has(spellNum)) {
            seenSpells.add(spellNum);
            uniqueSpellCount += 1;
            if (uniqueSpellCount % 3 === 0) {
              currentCost = 1;
              console.log(`Generalist: Spell ${spellNum} at index ${index} (unique spell #${uniqueSpellCount}), Cost=1`);
            }
          }

          lastSpell = spellNum;
          console.log(`Spell ${spellNum}: Base=${baseCost}, Final Cost=${currentCost}`);
          return sum + currentCost;
        }, 0);

        if (transcendenceActive) {
          totalManaCost *= 0.7;
          console.log('Transcendence: Total Cost=', totalManaCost);
        }

        totalClicks = cycleArray.length * 3;
        const costCycleDuration = cps > 0 ? totalClicks / cps : 0;
        manaCostPerSec = costCycleDuration > 0 ? totalManaCost / costCycleDuration : 0;
        console.log('Mana Cost Per Sec:', manaCostPerSec);
      }

      if (manaStormActive) {
        const manaStormBonus = (5 / 3) * cps;
        adjustedManaRegen += manaStormBonus;
        console.log(`Mana Storm: +${manaStormBonus.toFixed(2)}`);
      }

      if (invigoratingWaveActive) {
        const totemSlider = document.getElementById('totemSlider');
        const totemCpsInput = document.getElementById('totemCpsInput');
        const totemCount = totemSlider ? parseInt(totemSlider.value) || 1 : 1;
        const totemCps = totemCpsInput ? parseFloat(totemCpsInput.value) || 0 : 0;
        const manaPerTotemBase = reboundActive ? 6 : 3;
        const manaPerTotemCps = reboundActive ? 2 : 1;
        const cpsMana = (totemCps / 3) * totemCount * manaPerTotemCps;
        adjustedManaRegen += totemCount * manaPerTotemBase + cpsMana;
        console.log(`Invigorating Wave: +${(totemCount * manaPerTotemBase + cpsMana).toFixed(2)}`);
      }

      if (weightlessActive) {
        const hitsSlider = document.getElementById('hitsSlider');
        const hitsCount = hitsSlider ? parseInt(hitsSlider.value) || 0 : 0;
        const manaPerHit = 1.2;
        adjustedManaRegen += hitsCount * manaPerHit;
        console.log(`Weightless: +${hitsCount * manaPerHit}`);
      }

      if (sunflareActive) {
        let sunflareManaPool = totalManaPool;
        let intSkp = 0;
        try {
          const intSkpNode = document.evaluate('//*[@id="int-skp"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (intSkpNode) {
            const rawIntSkp = intSkpNode.tagName.toLowerCase() === 'input' ? intSkpNode.value.trim() : intSkpNode.textContent.trim();
            intSkp = parseFloat(rawIntSkp.match(/\d+(\.\d+)?/)?.[0]) || 0;
          }
          const intSkpPercent = mapIntToPercent(intSkp);
          sunflareManaPool += intSkpPercent;
          const sunflareMana = sunflareManaPool * 0.05;
          adjustedManaRegen += sunflareMana;
          console.log(`Sunflare: +${sunflareMana.toFixed(2)}`);
        } catch (e) {
          console.warn('Error in Sunflare:', e);
        }
      }

      if (wellOfPowerActive) {
        adjustedManaRegen += 3;
        console.log('Well of Power: +3');
      }

      const netMana = adjustedManaRegen - manaCostPerSec;

      // Calculate HP cost for Blood Pact
      if (bloodPactActive) {
        let hpPercentPerMana = haemorrhageActive ? 0.25 : 0.35;
        if (fallenAspectActive) {
          hpPercentPerMana -= 0.1;
        }
        const netManaDeficit = Math.max(0, manaCostPerSec - adjustedManaRegen);
        const hpCost = netManaDeficit * (hpPercentPerMana / 100) * totalHP;
        hpCostPerSec = hpCost;
        hpPercentPerSec = totalHP > 0 ? (hpCostPerSec / totalHP) * 100 : 0;
        console.log(`Blood Pact HP Cost: (${manaCostPerSec} - ${adjustedManaRegen}) * ${hpPercentPerMana}% * ${totalHP} HP = ${hpCost.toFixed(2)} HP/sec (${hpPercentPerSec.toFixed(2)}%)`);
      }

      console.log('Final:', { adjustedManaRegen, manaCostPerSec, hpCostPerSec, hpPercentPerSec, netMana, manaBank });

      // Update GUI
      const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = (isNaN(value) ? 0 : value).toFixed(1);
        } else {
          console.warn(`Element #${id} not found`);
        }
      };

      updateElement('manaRegen', adjustedManaRegen);
      updateElement('manaCost', manaCostPerSec);
      updateElement('manaBank', manaBank);
      updateElement('netMana', netMana);
      if (bloodPactActive) {
        const hpCostEl = document.getElementById('hpCost');
        if (hpCostEl) {
          hpCostEl.textContent = `${hpCostPerSec.toFixed(1)}/sec (${hpPercentPerSec.toFixed(2)}%)`;
        }
      } else {
        const hpCostEl = document.getElementById('hpCost');
        if (hpCostEl) {
          hpCostEl.textContent = '0/sec (0%)';
        }
      }
    } catch (e) {
      console.error('Error in updateManaCalc:', e);
      ['manaRegen', 'manaCost', 'hpCost', 'netMana', 'manaBank'].forEach(id => {
        const el = document.getElementById(id);
        if (el && id === 'hpCost') {
          el.textContent = '0/sec (0%)';
        } else if (el) {
          el.textContent = '0';
        }
      });
    }
  }

  // Initialize
  const initialize = () => {
    try {
      console.log('Initializing Mana Calculator');
      setupEventListeners();
      updateManaCalc();
    } catch (e) {
      console.error('Initialization error:', e);
    }
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Observe DOM changes in specific section
  const observerTarget = document.querySelector('#summary-stats') || document.body;
  const observer = new MutationObserver(() => {
    console.log('DOM changed');
    try {
      updateManaCalc();
      if (bloodPactActive) {
        updateSpellHPCosts(bloodPactActive);
      }
    } catch (e) {
      console.error('Error in MutationObserver:', e);
    }
  });
  observer.observe(observerTarget, { childList: true, subtree: true });
}