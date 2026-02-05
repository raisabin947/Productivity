// Simple calculator logic

const displayEl = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let expression = ''; // shown expression string

function updateDisplay() {
  displayEl.textContent = expression === '' ? '0' : expression;
}

function appendValue(val) {
  // Prevent multiple leading zeros
  if (expression === '0' && val === '0') return;
  // Avoid two decimals in the same number
  if (val === '.') {
    const parts = expression.split(/[\+\-\×\÷\*\/]/);
    const last = parts[parts.length - 1];
    if (last.includes('.')) return;
    if (last === '') val = '0.'; // start decimal like 0.
  }
  // Avoid repeated operators (replace last operator with new one)
  if (/[\+\-\×\÷\*\/]/.test(val)) {
    if (expression === '' && val !== '-') return; // don't start with operator except minus
    if (/[\+\-\×\÷\*\/]$/.test(expression)) {
      expression = expression.slice(0, -1) + val;
      updateDisplay();
      return;
    }
  }
  expression += val;
  updateDisplay();
}

function clearAll() {
  expression = '';
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function applyPercent() {
  // try to convert current expression value to percent: evaluate safely last number
  try {
    // Replace × ÷ with * /
    const safe = expression.replace(/×/g, '*').replace(/÷/g, '/');
    // find last number
    const parts = safe.match(/([0-9.]+)$/);
    if (!parts) return;
    const last = parts[1];
    const percentVal = (parseFloat(last) / 100).toString();
    expression = safe.slice(0, -last.length) + percentVal;
    // convert back * / to × ÷ for display
    expression = expression.replace(/\*/g, '×').replace(/\//g, '÷');
    updateDisplay();
  } catch (e) {
    // ignore
  }
}

function evaluateExpression() {
  if (expression === '') return;
  // Convert display operators to JS operators
  const toEval = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  // Prevent trailing operator
  if (/[\+\-\*\/]$/.test(toEval)) return;
  try {
    // Use Function instead of eval for marginally safer eval
    const result = Function('"use strict";return (' + toEval + ')')();
    expression = String(result);
    updateDisplay();
  } catch (e) {
    displayEl.textContent = 'Error';
    expression = '';
  }
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');
    if (action) {
      if (action === 'clear') clearAll();
      if (action === 'backspace') backspace();
      if (action === 'percent') applyPercent();
      if (action === 'equals') evaluateExpression();
    } else if (val) {
      appendValue(val);
    }
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((/^[0-9]$/).test(key)) appendValue(key);
  if (key === '.' || key === ',') appendValue('.');
  if (key === '+' || key === '-') appendValue(key);
  if (key === '*' || key === 'x' || key === 'X') appendValue('×');
  if (key === '/') appendValue('÷');
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    evaluateExpression();
  }
  if (key === 'Backspace') backspace();
  if (key === 'Escape') clearAll();
});