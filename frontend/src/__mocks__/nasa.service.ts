// Mock for NASA service
export const NASAService = {
  getAPOD: jest.fn(),
  getAPODRange: jest.fn(),
  getMarsRoverPhotos: jest.fn(),
  getRoverInfo: jest.fn(),
  getNEOFeed: jest.fn(),
  getNEOById: jest.fn(),
  getEPICImages: jest.fn(),
  healthCheck: jest.fn(),
};

export default NASAService;
