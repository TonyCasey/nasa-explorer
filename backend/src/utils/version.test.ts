import { getVersionString, getFullVersionInfo, getBuildInfo, VERSION_INFO } from './version';

describe('Backend Version Utils', () => {
  describe('getVersionString', () => {
    it('should return version string with v prefix', () => {
      const version = getVersionString();
      expect(version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(version).toBe(`v${VERSION_INFO.version}`);
    });
  });

  describe('VERSION_INFO', () => {
    it('should have all required fields', () => {
      expect(VERSION_INFO).toHaveProperty('major');
      expect(VERSION_INFO).toHaveProperty('minor');
      expect(VERSION_INFO).toHaveProperty('build');
      expect(VERSION_INFO).toHaveProperty('version');
      expect(VERSION_INFO).toHaveProperty('buildDate');
      expect(VERSION_INFO).toHaveProperty('description');
    });

    it('should be marked as backend API', () => {
      expect(VERSION_INFO.description).toContain('Backend API');
    });

    it('should have valid version format', () => {
      expect(VERSION_INFO.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have matching version components', () => {
      const expectedVersion = `${VERSION_INFO.major}.${VERSION_INFO.minor}.${VERSION_INFO.build}`;
      expect(VERSION_INFO.version).toBe(expectedVersion);
    });
  });

  describe('getFullVersionInfo', () => {
    it('should return full version info with build date', () => {
      const fullInfo = getFullVersionInfo();
      expect(fullInfo).toContain(VERSION_INFO.version);
      expect(fullInfo).toContain('Built');
    });
  });

  describe('getBuildInfo', () => {
    it('should return build info with build number', () => {
      const buildInfo = getBuildInfo();
      expect(buildInfo).toContain('Build');
      expect(buildInfo).toContain(VERSION_INFO.build.toString());
    });
  });
});