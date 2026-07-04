const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/react-native-onesignal/dist/index.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('setupListeners')) {
        console.log(`Line ${index + 1}: ${line}`);
        // Print 10 lines before and after
        const start = Math.max(0, index - 10);
        const end = Math.min(lines.length - 1, index + 10);
        for (let i = start; i <= end; i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
});
