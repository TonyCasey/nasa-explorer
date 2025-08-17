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
  major: 2,
  minor: 1,
  build: 247,
  version: '2.1.247',
  buildDate: new Date().toISOString(),
  description: 'NASA Space Explorer - UI Improvements Release',
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
