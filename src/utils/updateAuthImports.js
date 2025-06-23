const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
  'src/pages/WalletRiskProfile.tsx',
  'src/pages/SmartContracts.tsx',
  'src/pages/TokenVolatility.tsx',
  'src/pages/RiskVisualization.tsx',
  'src/pages/PriceTrends.tsx',
  'src/pages/PrivacyCenter.tsx',
  'src/pages/HybridRiskAnalysis.tsx',
  'src/pages/HybridRisk.tsx',
  'src/pages/CreditScoreNFT.tsx',
  'src/pages/ContractScanner.tsx',
  'src/pages/Contracts.tsx',
  'src/pages/ComplianceChecker.tsx',
  'src/pages/BankingAccounts.tsx',
  'src/pages/ApiDocs.tsx',
  'src/components/Sidebar.tsx'
];

// Root directory
const rootDir = path.resolve(__dirname, '../..');

// Update imports and usages
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(rootDir, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace import
    content = content.replace(
      /import\s+\{\s*useAuth\s*\}\s+from\s+['"]@\/contexts\/AuthContext['"];?/g,
      'import { useUser } from "@clerk/clerk-react";'
    );
    
    // Replace usage of useAuth
    content = content.replace(
      /const\s+\{\s*user\s*\}\s*=\s*useAuth\(\);/g,
      'const { user } = useUser();'
    );
    
    // Replace user.name with user.fullName || user.username
    content = content.replace(
      /user\?\.name/g,
      'user?.fullName || user?.username'
    );
    
    // Replace user.name?.[0] with proper initial
    content = content.replace(
      /user\?\.name\?\.(\[0\]|charAt\(0\))\?.toUpperCase\(\)/g,
      'user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()'
    );
    
    // Replace logout with signOut
    content = content.replace(
      /const\s+\{\s*logout\s*\}\s*=\s*useAuth\(\);/g,
      'const { signOut } = useClerk();'
    );
    
    content = content.replace(
      /onClick\s*=\s*\{\s*logout\s*\}/g,
      'onClick={() => signOut()}'
    );
    
    // Add useClerk import if needed
    if (content.includes('signOut') && !content.includes('useClerk')) {
      content = content.replace(
        /import\s+\{\s*useUser\s*\}\s+from\s+['"]@clerk\/clerk-react['"];?/g,
        'import { useUser, useClerk } from "@clerk/clerk-react";'
      );
    }
    
    // Write updated content back to file
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Auth imports update complete!');
