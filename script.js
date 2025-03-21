// Calculator state
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
    if (n > 170) return Infinity;
    if (n === 0) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculateExpression(expr) {
    try {
        let expression = expr
            .replace('×', '*')
            .replace('^', '**')
            .replace('π', Math.PI.toString())
            .replace('e', Math.E.toString())
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
        if (expression.match(/\(/g)?.length !== expression.match(/\)/g)?.length) {
            throw new Error('Unmatched parentheses');
        }

        const result = Function(`"use strict"; return ${expression}`)();
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
        undoStack.push(calculation);
        redoStack = [];
        updateDisplay();
    } catch (error) {
        const display = document.getElementById('display');
        if (display) {
            display.innerHTML = `<span style="color: #ff6666">${error.message}</span>`;
            calculation = '';
            setTimeout(() => {
                if (document.getElementById('display') === display) {
                    updateDisplay();
                }
            }, 1500);
        }
    }
}

function convertUnits(type) {
    const value = parseFloat(calculation);
    if (isNaN(value)) return;
    if (type === 'mToFt') calculation = (value * 3.28084).toString();
    if (type === 'kgToLb') calculation = (value * 2.20462).toString();
    undoStack.push(calculation);
    redoStack = [];
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('display');
    const preview = document.getElementById('preview');

    if (!display || !preview) {
        console.error("Display or preview element not found");
        return;
    }

    // Clear current content
    display.innerHTML = '';

    // Get the current calculation or default to '0'
    const text = calculation || '0';

    // Create a document fragment to build the highlighted content
    const fragment = document.createDocumentFragment();

    // Split the text into characters and process each one
    const numberPattern = /(\d+\.?\d*)/g;
    const operatorPattern = /[+\-×/^%()]/g;
    const functionPattern = /(sin|cos|tan|asin|acos|atan|log|ln|sqrt|π|e|mod|!)/g;
    let lastIndex = 0;
    const combinedPattern = new RegExp(
        `${numberPattern.source}|${operatorPattern.source}|${functionPattern.source}`,
        'g'
    );

    text.replace(combinedPattern, (match, number, offset) => {
        // Add any plain text before the match
        if (offset > lastIndex) {
            const plainText = document.createTextNode(text.slice(lastIndex, offset));
            fragment.appendChild(plainText);
        }

        // Create a span for the matched content
        const span = document.createElement('span');
        if (numberPattern.test(match)) {
            span.style.color = '#ffffff'; // Numbers in white
        } else if (operatorPattern.test(match)) {
            span.style.color = '#00ffff'; // Operators in cyan
        } else if (functionPattern.test(match)) {
            span.style.color = '#66ccff'; // Functions in light blue
        }
        span.textContent = match;
        fragment.appendChild(span);
        lastIndex = offset + match.length;
        return match;
    });

    // Add any remaining plain text
    if (lastIndex < text.length) {
        const plainText = document.createTextNode(text.slice(lastIndex));
        fragment.appendChild(plainText);
    }

    // Append the fragment to the display
    display.appendChild(fragment);

    // Update preview
    try {
        if (calculation) {
            const result = calculateExpression(calculation);
            preview.textContent = `= ${result.toLocaleString(undefined, {
                maximumFractionDigits: 10
            })}`;
            if (Math.abs(result) > 1e6) preview.textContent = `= ${result.toExponential(3)}`;
        } else {
            preview.textContent = '';
        }
    } catch {
        preview.textContent = '';
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('history');
    if (historyDiv) {
        historyDiv.innerHTML = history
            .map((item, i) => `<div class="history-item" onclick="reuseHistory(${i})">${item}</div>`)
            .join('');
    }
}

function reuseHistory(index) {
    calculation = history[index].split(' = ')[0];
    undoStack.push(calculation);
    redoStack = [];
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

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    const calculatorKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '+', '-', '*', '/', '(', ')', '.', 'Enter', 'Escape', 'Backspace',
        '^', '%', '!', 'p', 'e', 's', 'c', 't', 'l', 'n', 'r'
    ];

    if (calculatorKeys.includes(key) || event.ctrlKey || event.shiftKey) {
        event.preventDefault();
    }

    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) addToCalculation(key);
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

// Initialize display
updateDisplay();