// Kalkulatorku Interactive Calculator
// Author: IBM Granite-optimized logic & animation
// --- p5.js Canvas, Calculator Logic, UI, and Animations ---

// --- GLOBAL STATE ---
let bubbles = []; // {value, x, y, r, alpha, isResult, anim}
let lines = [];   // {fromIdx, toIdx, op, progress, color}
let inputExpr = '';
let tokens = [];
let result = null;
let animatingResult = false;
let animatingClear = false;
let clearAlpha = 1;
let history = [];
let darkMode = false;

// --- CANVAS DIMENSIONS ---
let canvasW = 500;
let canvasH = 320;

// --- OPERATOR COLORS ---
const OP_COLORS = {
  '+': '#4a90e2', // blue
  '-': '#e94e77', // red
  '*': '#a86ff7', // purple
  '/': '#2ed9ff'  // cyan
};

// --- OPERATOR SYMBOLS ---
const OP_SYMBOLS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};
const SYMBOL_TO_OP = {
  '+': '+',
  '−': '-',
  '×': '*',
  '÷': '/'
};

// --- p5.js SETUP ---
function setup() {
  const holder = document.getElementById('canvas-holder');
  canvasW = holder.offsetWidth;
  canvasH = holder.offsetHeight;
  let cnv = createCanvas(canvasW, canvasH);
  cnv.parent('canvas-holder');
  noStroke();
  textAlign(CENTER, CENTER);
  textFont('Montserrat');
  textSize(28);
  frameRate(60);
  resetCanvas();
}

function windowResized() {
  const holder = document.getElementById('canvas-holder');
  canvasW = holder.offsetWidth;
  canvasH = holder.offsetHeight;
  resizeCanvas(canvasW, canvasH);
  layoutBubbles();
}

// --- MAIN DRAW LOOP ---
function draw() {
  clear();
  if (document.body.classList.contains('dark-mode')) {
    background(35, 36, 42, 255);
  } else {
    background(250, 251, 252, 255);
  }

  // Draw lines (operations)
  for (let l of lines) {
    if (l.progress < 1) l.progress += 0.08;
    let from = bubbles[l.fromIdx];
    let to = bubbles[l.toIdx];
    if (!from || !to) continue;
    let x1 = lerp(from.x, to.x, 0.2);
    let y1 = lerp(from.y, to.y, 0.2);
    let x2 = lerp(from.x, to.x, l.progress);
    let y2 = lerp(from.y, to.y, l.progress);
    strokeWeight(5);
    stroke(l.color + 'cc');
    line(x1, y1, x2, y2);
    noStroke();
  }

  // Draw bubbles (numbers/results)
  for (let b of bubbles) {
    if (b.anim) animateBubble(b);
    drawBubble(b);
  }

  // Result fusion animation
  if (animatingResult) {
    animateResultFusion();
  }

  // Clear animation
  if (animatingClear) {
    clearAlpha -= 0.06;
    push();
    if (document.body.classList.contains('dark-mode')) {
      fill(35, 36, 42, 255 * (1 - clearAlpha));
    } else {
      fill(250, 251, 252, 255 * (1 - clearAlpha));
    }
    rect(0, 0, width, height);
    pop();
    if (clearAlpha <= 0) {
      animatingClear = false;
      clearAlpha = 1;
      resetCanvas();
    }
  }
}

// --- BUBBLE & LINE LAYOUT ---
function layoutBubbles() {
  // Arrange bubbles horizontally, centered
  let n = bubbles.length;
  if (n === 0) return;
  let spacing = Math.min(canvasW / (n + 1), 120);
  let cx = canvasW / 2;
  let cy = canvasH / 2;
  for (let i = 0; i < n; i++) {
    let b = bubbles[i];
    b.x = cx + (i - (n - 1) / 2) * spacing;
    b.y = cy + (b.isResult ? 0 : random(-10, 10));
  }
}

function drawBubble(b) {
  push();
  let alpha = b.alpha !== undefined ? b.alpha : 1;
  let color = document.body.classList.contains('dark-mode') ? [110, 198, 250, 60 * alpha] : [74, 144, 226, 60 * alpha];
  fill(...color);
  stroke(255, 255, 255, 120 * alpha);
  strokeWeight(b.isResult ? 5 : 2);
  ellipse(b.x, b.y, b.r * 2);
  noStroke();
  fill(document.body.classList.contains('dark-mode') ? 247 : 34, document.body.classList.contains('dark-mode') ? 250 : 34, document.body.classList.contains('dark-mode') ? 253 : 34, 220 * alpha);
  textSize(b.isResult ? 36 : 28);
  text(b.value, b.x, b.y);
  pop();
}

function animateBubble(b) {
  // Subtle pulsing
  let t = millis() / 600;
  b.r = b.baseR * (1 + 0.04 * sin(t + b.x));
}

// --- BUTTON HANDLING ---
function setupButtons() {
  const buttons = document.querySelectorAll('.crystal-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', e => {
      let val = btn.getAttribute('data-value');
      // Map display symbol to internal operator
      if (SYMBOL_TO_OP[val]) val = SYMBOL_TO_OP[val];
      handleButton(val, btn);
    });
    // Dynamic operator color
    if (btn.classList.contains('op-btn')) {
      let op = btn.getAttribute('data-value');
      // Use symbol-to-op for color
      let opKey = SYMBOL_TO_OP[op] || op;
      btn.style.color = OP_COLORS[opKey] || '#4a90e2';
    }
  });
}

function handleButton(val, btn) {
  if (val === 'C') {
    // Always reset everything, even during input
    inputExpr = '';
    resetCanvas();
    removeGreenAura();
    return;
  }
  if (val === '=') {
    if (inputExpr.length === 0) return;
    let evalResult = evaluateExpression(inputExpr);
    if (evalResult !== null && !isNaN(evalResult)) {
      result = evalResult;
      let displayExpr = prettifyExpr(inputExpr);
      history.unshift({ expr: inputExpr, displayExpr, result });
      if (history.length > 20) history.pop();
      updateHistory();
      triggerResultFusion(result);
      inputExpr = '';
    }
    return;
  }
  // Remove green aura on new input
  removeGreenAura();
  // Prevent double operator
  if ('+-*/'.includes(val) && (inputExpr === '' || '+-*/'.includes(inputExpr.slice(-1)))) return;
  inputExpr += val;
  updateCanvasFromInput();
  createRipple(btn, OP_COLORS[val] || '#6ec6fa');
}

function createRipple(btn, color) {
  let ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.background = color + '33';
  ripple.style.left = '50%';
  ripple.style.top = '50%';
  ripple.style.width = ripple.style.height = btn.offsetWidth + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
}

// --- CANVAS STATE MANAGEMENT ---
function resetCanvas() {
  bubbles = [];
  lines = [];
  tokens = [];
  result = null;
  animatingResult = false;
  animatingClear = false;
  clearAlpha = 1;
  updateCanvasFromInput();
}

function updateCanvasFromInput() {
  // Tokenize inputExpr and create bubbles/lines
  tokens = tokenize(inputExpr);
  bubbles = [];
  lines = [];
  let x = 0;
  for (let t of tokens) {
    if (typeof t === 'number') {
      let r = 32 + Math.min(38, Math.sqrt(Math.abs(t)) * 6);
      bubbles.push({ value: t, x: 0, y: 0, r, baseR: r, alpha: 1, isResult: false, anim: true });
    }
  }
  // Place bubbles
  layoutBubbles();
  // Create lines for operations
  let bIdx = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'number' && i + 1 < tokens.length && typeof tokens[i + 1] === 'string') {
      let op = tokens[i + 1];
      if (bIdx + 1 < bubbles.length) {
        lines.push({ fromIdx: bIdx, toIdx: bIdx + 1, op, progress: 0, color: OP_COLORS[op] || '#4a90e2' });
      }
      bIdx++;
    }
  }
}

function triggerClear() {
  animatingClear = true;
  clearAlpha = 1;
}

// --- RESULT FUSION ANIMATION ---
let fusionAnim = {
  progress: 0,
  burstAlpha: 0,
  burstR: 0,
  resultBubble: null
};
function triggerResultFusion(res) {
  animatingResult = true;
  fusionAnim.progress = 0;
  fusionAnim.burstAlpha = 1;
  fusionAnim.burstR = 0;
  let r = 44 + Math.min(48, Math.sqrt(Math.abs(res)) * 7);
  fusionAnim.resultBubble = { value: res, x: canvasW / 2, y: canvasH / 2, r, baseR: r, alpha: 0, isResult: true, anim: true };
  // Add green aura to display and '=' button
  document.getElementById('canvas-holder').classList.add('green-aura');
  const eqBtn = document.querySelector('.crystal-btn[data-value="="]');
  if (eqBtn) eqBtn.classList.add('green-aura');
}

// Remove green aura when new input or clear
function removeGreenAura() {
  document.getElementById('canvas-holder').classList.remove('green-aura');
  const eqBtn = document.querySelector('.crystal-btn[data-value="="]');
  if (eqBtn) eqBtn.classList.remove('green-aura');
}

function animateResultFusion() {
  // Move all bubbles to center, shrink/fade, then show result bubble with burst
  fusionAnim.progress += 0.04;
  let t = fusionAnim.progress;
  for (let b of bubbles) {
    b.x = lerp(b.x, canvasW / 2, t);
    b.y = lerp(b.y, canvasH / 2, t);
    b.alpha = 1 - t;
    b.r = lerp(b.baseR, 10, t);
  }
  // Light burst
  if (t > 0.7) {
    fusionAnim.burstR = lerp(0, 120, (t - 0.7) / 0.3);
    fusionAnim.burstAlpha = 1 - (t - 0.7) / 0.3;
    push();
    noStroke();
    fill(255, 255, 180, 120 * fusionAnim.burstAlpha);
    ellipse(canvasW / 2, canvasH / 2, fusionAnim.burstR * 2);
    pop();
  }
  // Fade in result bubble
  if (t > 0.8) {
    fusionAnim.resultBubble.alpha = (t - 0.8) / 0.2;
    drawBubble(fusionAnim.resultBubble);
  }
  if (t >= 1) {
    // End animation, show only result bubble
    bubbles = [fusionAnim.resultBubble];
    lines = [];
    animatingResult = false;
  }
}

// --- HISTORY SIDEBAR ---
function updateHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  for (let h of history) {
    let div = document.createElement('div');
    div.className = 'history-entry';
    let calc = document.createElement('div');
    calc.className = 'history-calc';
    calc.textContent = h.displayExpr;
    let res = document.createElement('div');
    res.className = 'history-result';
    res.textContent = '= ' + h.result;
    div.appendChild(calc);
    div.appendChild(res);
    list.appendChild(div);
  }
}

// --- EXPRESSION EVALUATION (IBM Granite-optimized) ---
// Tokenizer: "12+3*4" => [12, '+', 3, '*', 4]
function tokenize(expr) {
  let tokens = [];
  let num = '';
  for (let c of expr) {
    if ('0123456789'.includes(c)) {
      num += c;
    } else if ('+-*/'.includes(c)) {
      if (num !== '') {
        tokens.push(Number(num));
        num = '';
      }
      tokens.push(c);
    }
  }
  if (num !== '') tokens.push(Number(num));
  return tokens;
}

// Shunting Yard Algorithm for operator precedence
function evaluateExpression(expr) {
  let tokens = tokenize(expr);
  let output = [];
  let ops = [];
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  for (let t of tokens) {
    if (typeof t === 'number') {
      output.push(t);
    } else if ('+-*/'.includes(t)) {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) {
        output.push(ops.pop());
      }
      ops.push(t);
    }
  }
  while (ops.length) output.push(ops.pop());
  // Evaluate RPN
  let stack = [];
  for (let t of output) {
    if (typeof t === 'number') {
      stack.push(t);
    } else {
      let b = stack.pop();
      let a = stack.pop();
      if (t === '+') stack.push(a + b);
      else if (t === '-') stack.push(a - b);
      else if (t === '*') stack.push(a * b);
      else if (t === '/') stack.push(a / b);
    }
  }
  return stack.length ? stack[0] : null;
}

function prettifyExpr(expr) {
  // Replace * / - + with × ÷ − + for display
  return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−').replace(/\+/g, '+');
}

// --- DARK/LIGHT MODE TOGGLE ---
function setupModeToggle() {
  const btn = document.getElementById('mode-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    // Change icon
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  });
}

// --- Responsive: Resize canvas on orientation change ---
window.addEventListener('orientationchange', () => {
  setTimeout(windowResized, 300);
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  setupButtons();
  updateHistory();
  setupModeToggle();
}); 