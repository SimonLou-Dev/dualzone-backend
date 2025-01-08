const pino = require('pino');

const logger = pino({
  prettyPrint: {
    colorize: true,
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    }
  }
});

module.exports = logger;
