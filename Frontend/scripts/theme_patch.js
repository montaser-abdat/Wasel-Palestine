const fs = require('fs');
const path = require('path');

const rootPath = path.resolve(__dirname, '..');

function getAllCssFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllCssFiles(fullPath, fileList);
        } else if (file.endsWith('.css')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const targetDirs = [
    path.join(rootPath, 'features', 'admin'),
    path.join(rootPath, 'views', 'admin')
];

let cssFiles = [];
for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
        cssFiles = cssFiles.concat(getAllCssFiles(dir));
    }
}

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const replacements = [
        ['background-color: #ffffff;', 'background-color: var(--surface-bg, #ffffff);'],
        ['background: #ffffff;', 'background: var(--surface-bg, #ffffff);'],
        ['background-color: #fff;', 'background-color: var(--surface-bg, #ffffff);'],
        ['background: #fff;', 'background: var(--surface-bg, #ffffff);'],
        ['background-color: rgba(248, 250, 252, 0.5);', 'background-color: var(--table-th-bg, rgba(248, 250, 252, 0.5));'],
        ['background: rgba(248, 250, 252, 0.5);', 'background: var(--table-th-bg, rgba(248, 250, 252, 0.5));'],
        ['background-color: rgba(255, 255, 255, 0.5);', 'background-color: var(--surface-bg-50, rgba(255, 255, 255, 0.5));'],
        ['background-color: #f0f7ff;', 'background-color: var(--nav-active-bg, #f0f7ff);'],
        ['background: #f0f7ff;', 'background: var(--nav-active-bg, #f0f7ff);'],
        ['border: 1px solid #e2e8f0;', 'border: 1px solid var(--border-light, #e2e8f0);'],
        ['border-bottom: 1px solid #e2e8f0;', 'border-bottom: 1px solid var(--border-light, #e2e8f0);'],
    ];

    for (const [search, replace] of replacements) {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched: ${filePath.replace(rootPath, '')}`);
    }
}

cssFiles.forEach(patchFile);
console.log('CSS color patch complete!');
