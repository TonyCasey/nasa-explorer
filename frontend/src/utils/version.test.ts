import {
  getVersionString,
  getFullVersionInfo,
  getBuildInfo,
  VERSION_INFO,
} from './version';

describe('Version Utils', () => {
  describe('getVersionString', () => {
    it('should return version string with v prefix', () => {
      const version = getVersionString();
      expect(version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(version).toBe(`v${VERSION_INFO.version}`);
    });
  });

  describe('getFullVersionInfo', () => {
    it('should return full version info with build date', () => {
      const fullInfo = getFullVersionInfo();
      expect(fullInfo).toContain(VERSION_INFO.version);
      expect(fullInfo).toContain('Built');
    });

    it('should format the date correctly', () => {
      const fullInfo = getFullVersionInfo();
      // Should contain a formatted date (MM/DD/YYYY or similar)
      expect(fullInfo).toMatch(/\d+\/\d+\/\d+/);
    });
  });

  describe('getBuildInfo', () => {
    it('should return build info with build number and timestamp', () => {
      const buildInfo = getBuildInfo();
      expect(buildInfo).toContain('Build');
      expect(buildInfo).toContain(VERSION_INFO.build.toString());
    });

    it('should include formatted timestamp', () => {
      const buildInfo = getBuildInfo();
      // Should contain time info
      expect(buildInfo).toMatch(/\d+:\d+/); // Time format
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

    it('should have valid version format', () => {
      expect(VERSION_INFO.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have valid build date', () => {
      const buildDate = new Date(VERSION_INFO.buildDate);
      expect(buildDate).toBeInstanceOf(Date);
      expect(buildDate.getTime()).not.toBeNaN();
    });

    it('should have numeric version components', () => {
      expect(typeof VERSION_INFO.major).toBe('number');
      expect(typeof VERSION_INFO.minor).toBe('number');
      expect(typeof VERSION_INFO.build).toBe('number');
      expect(VERSION_INFO.major).toBeGreaterThanOrEqual(0);
      expect(VERSION_INFO.minor).toBeGreaterThanOrEqual(0);
      expect(VERSION_INFO.build).toBeGreaterThanOrEqual(0);
    });
  });
});
