const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/react-native-onesignal/dist/index.js');
const content = fs.readFileSync(filePath, 'utf8');

// Find NativeModules references
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('NativeModules')) {
        console.log(`Line ${index + 1}: ${line}`);
    }
});
