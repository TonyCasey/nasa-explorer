import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import api from './api';

describe('API Service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('API Configuration', () => {
    test('api instance is configured', () => {
      expect(api).toBeDefined();
      expect(api.defaults.baseURL).toBe('http://localhost:5000/api/v1');
      expect(api.defaults.timeout).toBe(30000);
    });

    test('api has default headers configured', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    test('api has interceptors', () => {
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });
  });

  describe('API Requests', () => {
    test('handles successful GET request', async () => {
      const responseData = { message: 'success' };
      mock.onGet('/test').reply(200, responseData);

      const response = await api.get('/test');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(responseData);
    });

    test('handles failed request', async () => {
      mock.onGet('/error').reply(500, { error: 'Server error' });

      await expect(api.get('/error')).rejects.toMatchObject({
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      });
    });

    test('handles network timeout', async () => {
      mock.onGet('/timeout').timeout();

      await expect(api.get('/timeout')).rejects.toMatchObject({
        code: 'ECONNABORTED',
      });
    });
  });
});
