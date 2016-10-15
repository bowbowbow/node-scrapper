const winston = require('winston');
const moment = require('moment');

module.exports = (file) => {
  console.log(`debug log file : ${file.debugFile}`);
  console.log(`exception log file : ${file.exceptionFile}`);


  winston.handleExceptions([
    new winston.transports.File({
      filename: file.exceptionFile,
      handleExceptions: true,
      json: false,
      colorize: false,
      prettyPrint: true,
      timestamp: () => {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      },
    }),
    new winston.transports.Console({
      handleExceptions: true,
      colorize: false,
      prettyPrint: true,
      humanReadableUnhandledException: true,
      timestamp: () => {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      },
    }),
  ]);

  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: 'info',
        colorize: true,
        prettyPrint: true,
        timestamp: () => {
          return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        },
      }),
      new winston.transports.File({
        level: 'debug',
        json: false,
        filename: file.debugFile,
        colorize: false,
        prettyPrint: true,
        timestamp: () => {
          return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        },
      }),
    ]
  });

  logger.setLevels(winston.config.syslog.levels);
  logger.exitOnError = false;
  return logger;
};