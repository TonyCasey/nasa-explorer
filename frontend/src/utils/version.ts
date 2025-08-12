export interface VersionInfo {
  major: number;
  minor: number;
  build: number;
  version: string;
  buildDate: string;
  description: string;
}

// This will be automatically updated by build scripts
export const VERSION_INFO: VersionInfo = {
  major: 1,
  minor: 1,
  build: 0,
  version: '1.1.0',
  buildDate: '2025-08-12T22:31:10.780Z',
  description: 'NASA Space Explorer - Initial Release',
};

export const getVersionString = (): string => {
  return `v${VERSION_INFO.version}`;
};

export const getFullVersionInfo = (): string => {
  const buildDate = new Date(VERSION_INFO.buildDate);
  return `${getVersionString()} - Built ${buildDate.toLocaleDateString()}`;
};

export const getBuildInfo = (): string => {
  return `Build ${VERSION_INFO.build} (${new Date(VERSION_INFO.buildDate).toLocaleString()})`;
};