const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Get log level from environment variable or default to 'info'
const level = process.env.LOG_LEVEL || 'info';

// Define custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport for all logs
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        info => `${info.timestamp} ${info.level}: ${info.message}`
      )
    )
  }),
  
  // File transport for error logs
  new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    dirname: 'logs',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }),
  
  // File transport for all logs
  new winston.transports.File({ 
    filename: 'logs/combined.log',
    dirname: 'logs',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  })
];

// Create logger instance
const logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
  exitOnError: false
});

// Export logger
module.exports = logger;
