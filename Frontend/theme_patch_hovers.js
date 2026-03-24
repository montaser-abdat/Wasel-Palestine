const fs = require('fs');
const path = require('path');

const rootPath = __dirname;

function getAllCssFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
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
    path.join(rootPath, 'Admin'),
    path.join(rootPath, 'components_Admin'),
    path.join(rootPath, 'commoncss_Admin')
];

let cssFiles = [];
for (const dir of targetDirs) {
    cssFiles = cssFiles.concat(getAllCssFiles(dir));
}

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const replacements = [
        // Hovers and Light backgrounds
        ['background-color: #f8fafc;', 'background-color: var(--background-light, #f8fafc);'],
        ['background: #f8fafc;', 'background: var(--background-light, #f8fafc);'],
        ['background-color: #f1f5f9;', 'background-color: var(--bg-hover, #f1f5f9);'],
        ['background: #f1f5f9;', 'background: var(--bg-hover, #f1f5f9);'],
        
        // Borders
        ['border: 1px solid #f1f5f9;', 'border: 1px solid var(--border-light, #f1f5f9);'],
        ['border-bottom: 1px solid #f1f5f9;', 'border-bottom: 1px solid var(--border-light, #f1f5f9);'],
        ['border-top: 1px solid #f1f5f9;', 'border-top: 1px solid var(--border-light, #f1f5f9);'],
        
        ['border: 1px solid #e2e8f0;', 'border: 1px solid var(--um-border, #e2e8f0);'],
        ['border-bottom: 1px solid #e2e8f0;', 'border-bottom: 1px solid var(--um-border, #e2e8f0);'],
        ['border-top: 1px solid #e2e8f0;', 'border-top: 1px solid var(--um-border, #e2e8f0);']
    ];

    for (const [search, replace] of replacements) {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched Hovers/Borders: ${filePath.replace(rootPath, '')}`);
    }
}

cssFiles.forEach(patchFile);
console.log('Hover/Border patch complete!');
