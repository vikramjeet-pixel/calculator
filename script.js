let calculation = '';
let memory = 0;
let history = [];
let undoStack = [];
let redoStack = [];

function addToCalculation(value) {
    calculation += value;
    undoStack.push(calculation);
    redoStack = [];
    updateDisplay();
}

function clearDisplay() {
    calculation = '';
    updateDisplay();
}

function memoryStore() {
    memory = parseFloat(calculateExpression(calculation)) || 0;
}

function memoryRecall() {
    calculation += memory.toString();
    updateDisplay();
}

function memoryClear() {
    memory = 0;
}

function memoryAdd() {
    memory += parseFloat(calculateExpression(calculation)) || 0;
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0) return NaN;
    if (n === 0) return 1;
    return n * factorial(n - 1);
}

function calculateExpression(expr) {
    try {
        let expression = expr
            .replace('×', '*')
            .replace('^', '**')
            .replace('π', Math.PI)
            .replace('e', Math.E)
            .replace('sin(', 'Math.sin(')
            .replace('cos(', 'Math.cos(')
            .replace('tan(', 'Math.tan(')
            .replace('asin(', 'Math.asin(')
            .replace('acos(', 'Math.acos(')
            .replace('atan(', 'Math.atan(')
            .replace('log(', 'Math.log10(')
            .replace('ln(', 'Math.log(')
            .replace('sqrt(', 'Math.sqrt(')
            .replace(/(\d+)!/g, (_, n) => factorial(parseInt(n)))
            .replace('mod', '%')
            .replace(/(\d+)%/g, (_, n) => `(${n}*0.01)`);

        if (!expression || !/[0-9]/.test(expression)) throw new Error('Invalid input');
        if (expression.includes('/0')) throw new Error('Division by zero');
        if (expression.match(/\(/g)?.length !== expression.match(/\)/g)?.length) throw new Error('Unmatched parentheses');

        const result = Function(`return ${expression}`)();
        if (isNaN(result) || !isFinite(result)) throw new Error('Calculation error');
        return Number(result.toFixed(10));
    } catch (error) {
        throw error;
    }
}

function calculate() {
    try {
        const result = calculateExpression(calculation);
        history.unshift(`${calculation} = ${result}`);
        updateHistory();
        calculation = result.toString();
        updateDisplay();
    } catch (error) {
        document.getElementById('display').innerHTML = `<span style="color: #ff6666">${error.message}</span>`;
        calculation = '';
        setTimeout(() => updateDisplay(), 1500);
    }
}

function convertUnits(type) {
    const value = parseFloat(calculation);
    if (isNaN(value)) return;
    if (type === 'mToFt') calculation = (value * 3.28084).toString();
    if (type === 'kgToLb') calculation = (value * 2.20462).toString();
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('display');
    const preview = document.getElementById('preview');
    display.textContent = calculation || '0';

    // Syntax highlighting
    display.innerHTML = calculation
        .replace(/(\d+\.?\d*)/g, '<span style="color: #ffffff">$1</span>')
        .replace(/[+\-*/^%()]/g, '<span style="color: #00ffff">$&</span>')
        .replace(/(sin|cos|tan|asin|acos|atan|log|ln|sqrt|π|e|mod|!)/g, '<span style="color: #66ccff">$1</span>');

    // Live preview
    try {
        const result = calculateExpression(calculation);
        preview.textContent = `= ${result.toLocaleString(undefined, { maximumFractionDigits: 10 })}`;
        if (Math.abs(result) > 1e6) preview.textContent = `= ${result.toExponential(3)}`;
    } catch {
        preview.textContent = '';
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = history.map((item, i) => `<div class="history-item" onclick="reuseHistory(${i})">${item}</div>`).join('');
}

function reuseHistory(index) {
    calculation = history[index].split(' = ')[0];
    updateDisplay();
}

function toggleTheme() {
    document.body.classList.toggle('light');
}

function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        calculation = undoStack[undoStack.length - 1] || '';
        updateDisplay();
    }
}

function redo() {
    if (redoStack.length > 0) {
        calculation = redoStack.pop();
        undoStack.push(calculation);
        updateDisplay();
    }
}

// Enhanced keyboard support
document.addEventListener('keydown', (event) => {
    event.preventDefault();
    const key = event.key;
    const validNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (validNumbers.includes(key)) addToCalculation(key);
    else if (key === '.') addToCalculation('.');
    else if (key === '+') addToCalculation('+');
    else if (key === '-') addToCalculation('-');
    else if (key === '*') addToCalculation('×');
    else if (key === '/') addToCalculation('/');
    else if (key === '(') addToCalculation('(');
    else if (key === ')') addToCalculation(')');
    else if (key === '^') addToCalculation('^');
    else if (key === '%') addToCalculation('%');
    else if (key === '!') addToCalculation('!');
    else if (key === 'p') addToCalculation('π');
    else if (key === 'e') addToCalculation('e');
    else if (key === 's') addToCalculation('sin(');
    else if (key === 'c') addToCalculation('cos(');
    else if (key === 't') addToCalculation('tan(');
    else if (key === 'l') addToCalculation('log(');
    else if (key === 'n') addToCalculation('ln(');
    else if (key === 'r') addToCalculation('sqrt(');
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Escape') clearDisplay();
    else if (key === 'Backspace') {
        calculation = calculation.slice(0, -1);
        updateDisplay();
    } else if (key === 'z' && event.ctrlKey) undo();
    else if (key === 'y' && event.ctrlKey) redo();
    else if (key === 'm' && event.shiftKey) memoryStore();
    else if (key === 'r' && event.shiftKey) memoryRecall();
});