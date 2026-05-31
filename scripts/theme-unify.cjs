const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../src/pages'),
  path.join(__dirname, '../src/components/dashboard'),
  path.join(__dirname, '../src/components/admin'),
  path.join(__dirname, '../src/components/inbox'),
  path.join(__dirname, '../src/components/settings'),
  path.join(__dirname, '../src/components/crm'),
  path.join(__dirname, '../src/components/chatbot'),
  path.join(__dirname, '../src/components/campaigns'),
];

const EXCLUDED_FILES = [
  'Landing.tsx', 'Blog.tsx', 'Contact.tsx', 'Documentation.tsx', 
  'Privacy.tsx', 'Terms.tsx', 'Login.tsx', 'Signup.tsx'
];

const REPLACEMENTS = [
  { regex: /bg-white dark:bg-gray-800/g, replacement: 'bg-[#0a0e27]' },
  { regex: /bg-gray-50 dark:bg-gray-900/g, replacement: 'bg-[#050816]' },
  { regex: /bg-gray-50 dark:bg-gray-800/g, replacement: 'bg-[#0a0e27]' },
  { regex: /bg-white dark:bg-gray-900/g, replacement: 'bg-[#0a0e27]' },
  { regex: /bg-gray-100 dark:bg-gray-800/g, replacement: 'bg-white/[0.04]' },
  { regex: /bg-gray-50 dark:bg-gray-700\/50/g, replacement: 'bg-white/[0.02]' },
  
  { regex: /border-gray-200 dark:border-gray-700/g, replacement: 'border-white/[0.1]' },
  { regex: /border-gray-300 dark:border-gray-600/g, replacement: 'border-white/[0.12]' },
  { regex: /border-gray-100 dark:border-gray-800/g, replacement: 'border-white/[0.05]' },
  { regex: /border-gray-200 dark:border-gray-800/g, replacement: 'border-white/[0.1]' },
  { regex: /border-gray-100 dark:border-gray-700/g, replacement: 'border-white/[0.08]' },
  
  { regex: /text-gray-900 dark:text-white/g, replacement: 'text-white' },
  { regex: /text-gray-800 dark:text-white/g, replacement: 'text-white' },
  { regex: /text-gray-600 dark:text-gray-400/g, replacement: 'text-gray-400' },
  { regex: /text-gray-700 dark:text-gray-300/g, replacement: 'text-gray-300' },
  { regex: /text-gray-500 dark:text-gray-400/g, replacement: 'text-gray-400' },
  { regex: /text-gray-500 dark:text-gray-500/g, replacement: 'text-gray-500' },
  { regex: /text-gray-700 dark:text-gray-400/g, replacement: 'text-gray-300' },
  { regex: /text-gray-800 dark:text-gray-200/g, replacement: 'text-gray-200' },
  
  { regex: /hover:bg-gray-50 dark:hover:bg-gray-700\/50/g, replacement: 'hover:bg-white/[0.04]' },
  { regex: /hover:bg-gray-50 dark:hover:bg-gray-700/g, replacement: 'hover:bg-white/[0.04]' },
  { regex: /hover:bg-gray-100 dark:hover:bg-gray-800/g, replacement: 'hover:bg-white/[0.06]' },
  { regex: /hover:bg-gray-50 dark:hover:bg-gray-800/g, replacement: 'hover:bg-white/[0.04]' },
  
  // Specific single replacements if they are alone
  { regex: /bg-gray-50/g, replacement: 'bg-[#050816]' },
  { regex: /bg-gray-100/g, replacement: 'bg-white/[0.04]' },
  
  // Clean up stray light classes that missed dark mode pairs
  { regex: /text-gray-900/g, replacement: 'text-white' },
  { regex: /text-gray-800/g, replacement: 'text-white' },
  { regex: /text-gray-600/g, replacement: 'text-gray-400' },
  { regex: /text-gray-700/g, replacement: 'text-gray-300' },
  { regex: /border-gray-200/g, replacement: 'border-white/[0.1]' },
  { regex: /border-gray-300/g, replacement: 'border-white/[0.12]' },
  
  // Finally replace lone bg-white with bg-[#0a0e27]
  { regex: /\bbg-white\b/g, replacement: 'bg-[#0a0e27]' }
];

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (EXCLUDED_FILES.includes(file)) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of REPLACEMENTS) {
        content = content.replace(regex, replacement);
      }
      
      // Clean up multiple spaces that might have been created
      content = content.replace(/className="(.*?)"/g, (match, p1) => {
        return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
      });
      content = content.replace(/className={`(.*?)`}/g, (match, p1) => {
        return `className={\`${p1.replace(/\s+/g, ' ').trim()}\`}`;
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

console.log('Starting UI theme unification...');
for (const dir of DIRECTORIES) {
  processDirectory(dir);
}
console.log('Done.');
