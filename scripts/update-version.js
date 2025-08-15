#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the main version.json file
const versionJsonPath = path.join(__dirname, '..', 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));

// Update build date to current time
versionData.buildDate = new Date().toISOString();

// Write back to version.json
fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2));

// Generate TypeScript version content
const tsContent = `export interface VersionInfo {
  major: number;
  minor: number;
  build: number;
  version: string;
  buildDate: string;
  description: string;
}

// This will be automatically updated by build scripts
export const VERSION_INFO: VersionInfo = {
  major: ${versionData.major},
  minor: ${versionData.minor},
  build: ${versionData.build},
  version: '${versionData.version}',
  buildDate: '${versionData.buildDate}',
  description: '${versionData.description}',
};

export const getVersionString = (): string => {
  return \`v\${VERSION_INFO.version}\`;
};

export const getFullVersionInfo = (): string => {
  const buildDate = new Date(VERSION_INFO.buildDate);
  return \`\${getVersionString()} - Built \${buildDate.toLocaleDateString()}\`;
};

export const getBuildInfo = (): string => {
  return \`Build \${VERSION_INFO.build} (\${new Date(VERSION_INFO.buildDate).toLocaleString()})\`;
};
`;

// Update frontend version.ts
const frontendVersionPath = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'version.ts');
fs.writeFileSync(frontendVersionPath, tsContent);
console.log('✅ Updated frontend version.ts');

// Update backend version.ts with slightly different description
const backendTsContent = tsContent.replace(
  `description: '${versionData.description}'`,
  `description: '${versionData.description} Backend API'`
);
const backendVersionPath = path.join(__dirname, '..', 'backend', 'src', 'utils', 'version.ts');
fs.writeFileSync(backendVersionPath, backendTsContent);
console.log('✅ Updated backend version.ts');

console.log(`\n📦 Version updated to ${versionData.version}`);
console.log(`📅 Build date: ${versionData.buildDate}`);
console.log(`📝 Description: ${versionData.description}`);