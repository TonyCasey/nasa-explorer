import { getVersionString, getFullVersionInfo, getBuildInfo, VERSION_INFO } from './version';

describe('Version Utility', () => {
  it('should return version string', () => {
    const version = getVersionString();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('should have version info object', () => {
    expect(VERSION_INFO).toHaveProperty('version');
    expect(VERSION_INFO).toHaveProperty('buildDate');
    expect(VERSION_INFO).toHaveProperty('major');
    
    expect(typeof VERSION_INFO.version).toBe('string');
    expect(typeof VERSION_INFO.buildDate).toBe('string');
    expect(typeof VERSION_INFO.major).toBe('number');
  });

  it('should include proper version format', () => {
    const versionString = getVersionString();
    
    // Version should be in format like v1.0.0
    expect(versionString).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('should have consistent version between string and info', () => {
    const versionString = getVersionString();
    
    expect(versionString).toContain(VERSION_INFO.version);
  });

  it('should include build date', () => {
    const buildInfo = getBuildInfo();
    
    expect(buildInfo).toBeDefined();
    expect(buildInfo.length).toBeGreaterThan(0);
  });

  it('should provide full version info', () => {
    const fullInfo = getFullVersionInfo();
    
    expect(fullInfo).toContain('v');
    expect(fullInfo).toContain('Built');
  });

  it('should have valid build date format', () => {
    const buildDate = new Date(VERSION_INFO.buildDate);
    expect(buildDate).toBeInstanceOf(Date);
    expect(buildDate.getTime()).not.toBeNaN();
  });

  it('should have version string with proper length', () => {
    const versionString = getVersionString();
    
    // Should contain version and build information
    expect(versionString.length).toBeGreaterThan(5);
  });
});