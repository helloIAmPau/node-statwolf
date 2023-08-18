let _logger = console.log;

export const setDefaultLogger = function(logger) {
  _logger = logger;
};

export const log = function(message) {
  if(typeof(message) !== 'string') {
    message = JSON.stringify(message);
  }

  _logger(message);
};
