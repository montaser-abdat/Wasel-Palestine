const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'Admin', 'Pages');
const pages = [
  'Dashboard', 'Incidents', 'PerformanceReports', 'AuditLog', 
  'CheckpointManagement', 'ModerationQueue', 'UserManagement', 
  'SystemSettings', 'APIMonitor'
];

pages.forEach(page => {
  const filePath = path.join(adminDir, page, `${page}.html`);
  if (!fs.existsSync(filePath)) {
     console.log(`Skipping ${filePath}`);
     return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // If it already has an HTML tag, skip
  if (content.match(/<html/i)) {
      console.log(`${page} already has html tags.`);
      return;
  }
  
  // Remove the old stylesheet link if it exists to avoid duplication
  content = content.replace(/<link rel="stylesheet"[^>]+>/g, '');

  const boilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Wasel Palestine | ${page}</title>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="../../../commoncss_Admin/admin-shell.css" />
    <link rel="stylesheet" href="./${page}.css" />
</head>
<body class="admin-body">
${content.trim()}
</body>
</html>`;

  fs.writeFileSync(filePath, boilerplate, 'utf8');
  console.log(`Updated ${page}.html to be a full page!`);
});
