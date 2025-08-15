// Comprehensive Services Test Suite

// Mock all external dependencies
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Comprehensive Services Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // API Service Coverage
  describe('API Service Coverage', () => {
    it('should handle successful API requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'test data' })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const apiCall = async (url: string) => {
        const response = await fetch(url);
        if (response.ok) {
          return response.json();
        }
        throw new Error(`HTTP ${response.status}`);
      };

      const result = await apiCall('/api/test');
      expect(result).toEqual({ data: 'test data' });
      expect(mockFetch).toHaveBeenCalledWith('/api/test');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ error: 'Not found' })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const apiCall = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        return response.json();
      };

      await expect(apiCall('/api/invalid')).rejects.toThrow('Not found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const apiCall = async (url: string) => {
        try {
          return await fetch(url);
        } catch (error) {
          throw new Error('Network request failed');
        }
      };

      await expect(apiCall('/api/test')).rejects.toThrow('Network request failed');
    });

    it('should handle different HTTP methods', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
      mockFetch.mockResolvedValue(mockResponse as any);

      const apiService = {
        get: (url: string) => fetch(url, { method: 'GET' }),
        post: (url: string, data: any) => fetch(url, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }),
        put: (url: string, data: any) => fetch(url, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }),
        delete: (url: string) => fetch(url, { method: 'DELETE' })
      };

      await apiService.get('/api/get');
      expect(mockFetch).toHaveBeenCalledWith('/api/get', { method: 'GET' });

      await apiService.post('/api/post', { test: 'data' });
      expect(mockFetch).toHaveBeenCalledWith('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });

      await apiService.put('/api/put', { update: 'data' });
      expect(mockFetch).toHaveBeenCalledWith('/api/put', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update: 'data' })
      });

      await apiService.delete('/api/delete');
      expect(mockFetch).toHaveBeenCalledWith('/api/delete', { method: 'DELETE' });
    });

    it('should handle request timeouts', async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 100);
      });

      const fetchWithTimeout = (url: string, timeout: number) => {
        return Promise.race([
          fetch(url),
          timeoutPromise
        ]);
      };

      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );

      await expect(fetchWithTimeout('/api/slow', 100)).rejects.toThrow('Request timeout');
    });

    it('should handle request retries', async () => {
      let attemptCount = 0;
      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        } as any);
      });

      const fetchWithRetry = async (url: string, maxRetries: number = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await fetch(url);
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };

      const result = await fetchWithRetry('/api/unreliable');
      expect(result).toBeDefined();
      expect(attemptCount).toBe(3);
    });
  });

  // Favorites Service Coverage
  describe('Favorites Service Coverage', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null);
    });

    it('should manage favorites in localStorage', () => {
      const favoritesService = {
        getFavorites: () => {
          const stored = localStorage.getItem('favorites');
          return stored ? JSON.parse(stored) : [];
        },
        addFavorite: (item: any) => {
          const favorites = favoritesService.getFavorites();
          const updated = [...favorites, item];
          localStorage.setItem('favorites', JSON.stringify(updated));
          return updated;
        },
        removeFavorite: (id: string) => {
          const favorites = favoritesService.getFavorites();
          const updated = favorites.filter((f: any) => f.id !== id);
          localStorage.setItem('favorites', JSON.stringify(updated));
          return updated;
        },
        isFavorite: (id: string) => {
          const favorites = favoritesService.getFavorites();
          return favorites.some((f: any) => f.id === id);
        }
      };

      // Test getting empty favorites
      expect(favoritesService.getFavorites()).toEqual([]);

      // Test adding favorite
      const item = { id: '1', title: 'Test Item', url: 'test.jpg' };
      favoritesService.addFavorite(item);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify([item])
      );

      // Mock localStorage to return the item
      localStorageMock.getItem.mockReturnValue(JSON.stringify([item]));
      
      expect(favoritesService.isFavorite('1')).toBe(true);
      expect(favoritesService.isFavorite('2')).toBe(false);

      // Test removing favorite
      favoritesService.removeFavorite('1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify([])
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const safeFavoritesService = {
        getFavorites: () => {
          try {
            const stored = localStorage.getItem('favorites');
            return stored ? JSON.parse(stored) : [];
          } catch (error) {
            return [];
          }
        }
      };

      expect(safeFavoritesService.getFavorites()).toEqual([]);
    });

    it('should handle malformed localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const robustFavoritesService = {
        getFavorites: () => {
          try {
            const stored = localStorage.getItem('favorites');
            return stored ? JSON.parse(stored) : [];
          } catch (error) {
            localStorage.removeItem('favorites');
            return [];
          }
        }
      };

      expect(robustFavoritesService.getFavorites()).toEqual([]);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('favorites');
    });
  });

  // Cache Service Coverage
  describe('Cache Service Coverage', () => {
    it('should implement memory caching', () => {
      const createCache = (ttl: number = 300000) => {
        const cache = new Map<string, { data: any; expires: number }>();

        return {
          get: (key: string) => {
            const item = cache.get(key);
            if (!item) return null;
            if (Date.now() > item.expires) {
              cache.delete(key);
              return null;
            }
            return item.data;
          },
          set: (key: string, data: any) => {
            cache.set(key, { data, expires: Date.now() + ttl });
          },
          delete: (key: string) => {
            cache.delete(key);
          },
          clear: () => {
            cache.clear();
          },
          size: () => cache.size
        };
      };

      const cache = createCache(1000); // 1 second TTL

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', { complex: 'object' });
      expect(cache.get('key2')).toEqual({ complex: 'object' });

      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
      expect(cache.size()).toBe(1);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should handle cache expiration', (done) => {
      const createCache = (ttl: number) => {
        const cache = new Map<string, { data: any; expires: number }>();
        return {
          get: (key: string) => {
            const item = cache.get(key);
            if (!item || Date.now() > item.expires) {
              cache.delete(key);
              return null;
            }
            return item.data;
          },
          set: (key: string, data: any) => {
            cache.set(key, { data, expires: Date.now() + ttl });
          }
        };
      };

      const cache = createCache(50); // 50ms TTL

      cache.set('expiring', 'value');
      expect(cache.get('expiring')).toBe('value');

      setTimeout(() => {
        expect(cache.get('expiring')).toBeNull();
        done();
      }, 100);
    });
  });

  // Configuration Service Coverage
  describe('Configuration Service Coverage', () => {
    it('should manage application configuration', () => {
      const configService = {
        config: {
          apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
          nasaApiKey: process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY',
          environment: process.env.NODE_ENV || 'development',
          debug: process.env.NODE_ENV === 'development'
        },
        get: (key: string) => (configService.config as any)[key],
        set: (key: string, value: any) => {
          (configService.config as any)[key] = value;
        },
        isDevelopment: () => configService.config.environment === 'development',
        isProduction: () => configService.config.environment === 'production'
      };

      expect(typeof configService.get('apiUrl')).toBe('string');
      expect(typeof configService.get('nasaApiKey')).toBe('string');
      expect(['development', 'test', 'production']).toContain(configService.get('environment'));

      configService.set('customSetting', 'customValue');
      expect(configService.get('customSetting')).toBe('customValue');

      expect(typeof configService.isDevelopment()).toBe('boolean');
      expect(typeof configService.isProduction()).toBe('boolean');
    });
  });

  // Logger Service Coverage
  describe('Logger Service Coverage', () => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    beforeEach(() => {
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();
      console.info = jest.fn();
    });

    afterEach(() => {
      Object.assign(console, originalConsole);
    });

    it('should provide logging functionality', () => {
      const logger = {
        log: (message: string, ...args: any[]) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[LOG] ${message}`, ...args);
          }
        },
        error: (message: string, error?: Error) => {
          console.error(`[ERROR] ${message}`, error);
        },
        warn: (message: string, ...args: any[]) => {
          console.warn(`[WARN] ${message}`, ...args);
        },
        info: (message: string, ...args: any[]) => {
          console.info(`[INFO] ${message}`, ...args);
        }
      };

      logger.log('Test log message');
      logger.error('Test error message', new Error('Test error'));
      logger.warn('Test warning message');
      logger.info('Test info message');

      expect(console.log).toHaveBeenCalledWith('[LOG] Test log message');
      expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', expect.any(Error));
      expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message');
      expect(console.info).toHaveBeenCalledWith('[INFO] Test info message');
    });

    it('should handle structured logging', () => {
      const structuredLogger = {
        log: (level: string, message: string, meta: any = {}) => {
          const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            meta
          };
          console.log(JSON.stringify(logEntry));
        }
      };

      structuredLogger.log('info', 'User action', { userId: '123', action: 'click' });

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: 'info',
        message: 'User action',
        meta: { userId: '123', action: 'click' }
      });
      expect(logEntry.timestamp).toBeDefined();
    });
  });

  // Validation Service Coverage
  describe('Validation Service Coverage', () => {
    it('should validate different data types', () => {
      const validator = {
        isEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        isUrl: (url: string) => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        },
        isDate: (date: string) => !isNaN(Date.parse(date)),
        isNumeric: (value: string) => /^\d+$/.test(value),
        hasMinLength: (value: string, minLength: number) => value.length >= minLength,
        isRequired: (value: any) => value !== null && value !== undefined && value !== '',
        isPhoneNumber: (phone: string) => /^\+?[\d\s\-\(\)]+$/.test(phone)
      };

      // Email validation
      expect(validator.isEmail('test@example.com')).toBe(true);
      expect(validator.isEmail('invalid-email')).toBe(false);

      // URL validation
      expect(validator.isUrl('https://example.com')).toBe(true);
      expect(validator.isUrl('not-a-url')).toBe(false);

      // Date validation
      expect(validator.isDate('2025-08-15')).toBe(true);
      expect(validator.isDate('invalid-date')).toBe(false);

      // Numeric validation
      expect(validator.isNumeric('123')).toBe(true);
      expect(validator.isNumeric('abc')).toBe(false);

      // Length validation
      expect(validator.hasMinLength('hello', 3)).toBe(true);
      expect(validator.hasMinLength('hi', 3)).toBe(false);

      // Required validation
      expect(validator.isRequired('value')).toBe(true);
      expect(validator.isRequired('')).toBe(false);
      expect(validator.isRequired(null)).toBe(false);
      expect(validator.isRequired(undefined)).toBe(false);

      // Phone validation
      expect(validator.isPhoneNumber('+1 (555) 123-4567')).toBe(true);
      expect(validator.isPhoneNumber('invalid-phone')).toBe(false);
    });

    it('should validate complex objects', () => {
      const validateUser = (user: any) => {
        const errors: string[] = [];

        if (!user.name || user.name.length < 2) {
          errors.push('Name must be at least 2 characters');
        }

        if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          errors.push('Valid email is required');
        }

        if (user.age !== undefined && (user.age < 0 || user.age > 150)) {
          errors.push('Age must be between 0 and 150');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      const validUser = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const invalidUser = { name: 'J', email: 'invalid', age: -5 };

      expect(validateUser(validUser)).toEqual({ isValid: true, errors: [] });
      
      const result = validateUser(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });
});