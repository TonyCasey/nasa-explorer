import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request
  console.log(`🔄 ${method} ${url} - ${ip} - ${new Date().toISOString()}`);
  
  // Hook into response finish event for logging
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusIcon = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusIcon} ${method} ${url} - ${statusCode} - ${duration}ms`);
  });
  
  next();
};