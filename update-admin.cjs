const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/App.tsx',
  'src/components/admin/AdminProtectedRoute.tsx',
  'src/components/admin/AdminSidebar.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/admin/AdminLogin.tsx',
  'src/pages/admin/SubscriptionManagement.tsx',
  'src/services/api.ts',
];

filesToUpdate.forEach(file => {
  const filePath = path.join('C:\\Users\\Sameer Thakur\\WabMeta', file);
  if (!fs.existsSync(filePath)) {
    console.log('File not found: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (file === 'src/services/api.ts') {
    // Only replace frontend location checks, not API urls
    content = content.replace(/window\.location\.pathname\.startsWith\('\/admin'\)/g, "window.location.pathname.startsWith('/manage-wabmeta-admin')");
    content = content.replace(/window\.location\.href = '\/admin\/login'/g, "window.location.href = '/manage-wabmeta-admin/login'");
  } else {
    // Replace all '/admin...' strings with '/manage-wabmeta-admin...'
    content = content.replace(/'\/admin/g, "'/manage-wabmeta-admin");
    content = content.replace(/"\/admin/g, "\"/manage-wabmeta-admin");
    content = content.replace(/`\/admin/g, "`/manage-wabmeta-admin");
    
    // Replace Regex pattern in App.tsx
    content = content.replace(/pattern: \/\^\\\\\/admin\\\\\/\(\.\\\+\)\$\//g, "pattern: /^\\/manage-wabmeta-admin\\/(.+)$/");
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
