#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '..', 'version.json');
const FRONTEND_VERSION_FILE = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'version.ts');
const BACKEND_VERSION_FILE = path.join(__dirname, '..', 'backend', 'src', 'utils', 'version.ts');

function loadVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    console.error('version.json not found!');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
}

function saveVersion(versionData) {
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2));
}

function updateVersionFiles(versionData) {
  const frontendTemplate = `export interface VersionInfo {
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
};`;

  const backendTemplate = `export interface VersionInfo {
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
  description: '${versionData.description} Backend API',
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
};`;

  fs.writeFileSync(FRONTEND_VERSION_FILE, frontendTemplate);
  fs.writeFileSync(BACKEND_VERSION_FILE, backendTemplate);
}

function bumpVersion(type, message) {
  const versionData = loadVersion();
  
  // Increment version based on type
  switch(type) {
    case 'major':
      versionData.major++;
      versionData.minor = 0;
      versionData.build = 0;
      break;
    case 'minor':
      versionData.minor++;
      versionData.build = 0;
      break;
    case 'build':
    default:
      versionData.build++;
      break;
  }
  
  // Update version string and build date
  versionData.version = `${versionData.major}.${versionData.minor}.${versionData.build}`;
  versionData.buildDate = new Date().toISOString();
  
  // Add changelog entry
  if (message) {
    const changelogEntry = {
      version: versionData.version,
      date: new Date().toISOString().split('T')[0],
      changes: [message]
    };
    
    if (!versionData.changelog) {
      versionData.changelog = [];
    }
    
    versionData.changelog.unshift(changelogEntry);
  }
  
  // Save and update files
  saveVersion(versionData);
  updateVersionFiles(versionData);
  
  console.log(`Version bumped to ${versionData.version}`);
  return versionData;
}

function getCommitMessage(message, versionData) {
  const version = versionData ? versionData.version : loadVersion().version;
  return `v${version}: ${message}`;
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch(command) {
  case 'bump':
    const type = args[1] || 'build';
    const message = args.slice(2).join(' ') || 'Version bump';
    bumpVersion(type, message);
    break;
    
  case 'commit-message':
    const commitMsg = args.slice(1).join(' ');
    console.log(getCommitMessage(commitMsg));
    break;
    
  case 'current':
    const current = loadVersion();
    console.log(`v${current.version}`);
    break;
    
  default:
    console.log('Usage:');
    console.log('  node scripts/version.js bump [major|minor|build] [message]');
    console.log('  node scripts/version.js commit-message [message]');
    console.log('  node scripts/version.js current');
    break;
}

module.exports = { bumpVersion, getCommitMessage, loadVersion };