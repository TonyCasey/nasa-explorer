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
  minor: 0,
  build: 1,
  version: '1.0.1',
  buildDate: '2025-08-12T20:50:00.000Z',
  description: 'NASA Space Explorer Backend API - Initial Release',
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