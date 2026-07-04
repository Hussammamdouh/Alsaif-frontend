const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== '.bin' && file !== 'typescript' && file !== '@types') {
                results = results.concat(searchDir(filePath, pattern));
            }
        } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes(pattern)) {
                    results.push(filePath);
                }
            } catch (err) {
                // ignore
            }
        }
    });
    return results;
}

console.log('Searching for "setupListeners"...');
const matches = searchDir(path.join(__dirname, '../node_modules'), 'setupListeners');
console.log('Found matches:', matches);
