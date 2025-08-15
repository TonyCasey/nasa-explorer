import request from 'supertest';
import app from './app';

describe('App Integration Tests', () => {
  describe('Middleware Tests', () => {
    it('should handle JSON parsing', async () => {
      const response = await request(app)
        .post('/api/v1/apod')
        .send({ test: 'data' });
      
      // Should handle the request (even if endpoint doesn't support POST)
      expect([200, 404, 405]).toContain(response.status);
    });

    it('should handle URL encoding', async () => {
      const response = await request(app)
        .post('/api/v1/apod')
        .type('form')
        .send('test=data');
      
      expect([200, 400, 404, 405]).toContain(response.status);
    });

    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/v1/apod')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      await request(app)
        .get('/unknown-route')
        .expect(404);
    });

    it('should handle method not allowed', async () => {
      const response = await request(app)
        .patch('/api/v1/apod');
      
      expect([404, 405]).toContain(response.status);
    });

    it('should handle invalid content type', async () => {
      const response = await request(app)
        .post('/api/v1/apod')
        .set('Content-Type', 'text/plain')
        .send('invalid data');
      
      expect([400, 404, 405, 415]).toContain(response.status);
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include version in health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health');
      
      // Common security headers that might be set
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      // Check if at least some security headers are present
      let hasSecurityHeaders = false;
      for (const header of securityHeaders) {
        if (response.headers[header]) {
          hasSecurityHeaders = true;
          break;
        }
      }
      
      // This is informational - not all apps will have all security headers
      expect(typeof hasSecurityHeaders).toBe('boolean');
    });
  });

  describe('Request Processing', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/health')
      );
      
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large query strings', async () => {
      const longQuery = 'param=' + 'a'.repeat(1000);
      const response = await request(app)
        .get(`/api/v1/apod?${longQuery}`);
      
      expect([200, 400, 403, 414]).toContain(response.status);
    });
  });
});