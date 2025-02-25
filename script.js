let calculation = '';

function addToCalculation(value) {
    calculation += value;
    updateDisplay();
}

function clearDisplay() {
    calculation = '';
    updateDisplay();
}

function calculate() {
    try {
        // Sanitize and prepare the expression
        let expression = calculation
            .replace('×', '*')
            .replace(/[^0-9+\-*/().]/g, ''); // Remove invalid characters

        // Validate expression
        if (!expression || !/[0-9]/.test(expression)) {
            throw new Error('Invalid input');
        }

        // Check for division by zero
        if (expression.includes('/0')) {
            throw new Error('Division by zero');
        }

        // Evaluate the expression safely
        const result = Function(`return ${expression}`)();
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Calculation error');
        }

        // Format result to avoid floating point precision issues
        calculation = Number(result.toFixed(10)).toString();
        updateDisplay();
    } catch (error) {
        document.getElementById('display').textContent = error.message;
        calculation = '';
        setTimeout(() => updateDisplay(), 1500);
    }
}

function updateDisplay() {
    const display = document.getElementById('display');
    display.textContent = calculation || '0';
}

// Improved keyboard support
document.addEventListener('keydown', (event) => {
    event.preventDefault(); // Prevent default browser behavior
    
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
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Escape' || key === 'c' || key === 'C') clearDisplay();
    else if (key === 'Backspace') {
        calculation = calculation.slice(0, -1);
        updateDisplay();
    }
});