type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class FrontendLogger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    this.logLevel = (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    return entry;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Only log errors in production to reduce noise
    if (process.env.NODE_ENV === 'development' || entry.level === 'error') {
      const consoleMethod =
        entry.level === 'error'
          ? 'error'
          : entry.level === 'warn'
            ? 'warn'
            : entry.level === 'debug'
              ? 'debug'
              : 'log';

      console[consoleMethod](
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.data || '',
        entry.error || ''
      );
    }

    this.saveToStorage();
  }

  private saveToStorage(): void {
    // Skip localStorage in production for simplicity
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `nasa_explorer_logs_${today}`;
      const todayLogs = this.logs.filter((log) =>
        log.timestamp.startsWith(today)
      );
      localStorage.setItem(storageKey, JSON.stringify(todayLogs));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.addLog(this.createLogEntry('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      this.addLog(this.createLogEntry('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      this.addLog(this.createLogEntry('warn', message, data));
    }
  }

  error(message: string, error?: Error, data?: any): void {
    if (this.shouldLog('error')) {
      this.addLog(this.createLogEntry('error', message, data, error));
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsForDate(date: string): LogEntry[] {
    try {
      const storageKey = `nasa_explorer_logs_${date}`;
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve logs from localStorage:', error);
      return [];
    }
  }

  clearLogs(): void {
    this.logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `nasa_explorer_logs_${today}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear logs from localStorage:', error);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

const logger = new FrontendLogger();
export default logger;
export { FrontendLogger };

export const logApiRequest = (method: string, url: string, data?: any) => {
  logger.debug(`API Request: ${method} ${url}`, { method, url, data });
};

export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  data?: any
) => {
  const message = `API Response: ${method} ${url} - ${status}`;
  if (status >= 400) {
    logger.error(message, undefined, { method, url, status, data });
  } else {
    logger.debug(message, { method, url, status, data });
  }
};

export const logApiError = (method: string, url: string, error: Error) => {
  logger.error(`API Error: ${method} ${url}`, error, { method, url });
};
