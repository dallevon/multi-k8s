const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

const fib = (index, values = {}) => {
  let result;
  const preceding = parseInt(values[index - 1]);
  const prePreceding = parseInt(values[index - 2]);
  switch (true) {
    case index === 0: {
      result = 0;
      break;
    }
    case index === 1:
    case index === 2: {
      result = 1;
      break;
    }
    case !(isNaN(preceding) || isNaN(prePreceding)):
      result = preceding + prePreceding;
      break;
    case isNaN(preceding) && !isNaN(prePreceding):
      result = fib(index - 1) + prePreceding;
      break;
    case !isNaN(preceding) && isNaN(prePreceding):
      result = preceding + fib(index - 2);
      break;
    case index > 40:
      result = 'Index too high';
      break;
    default:
      result = fib(index - 1, values) + fib(index - 2, values);
  }
  redisClient.hset('values', index, result);
  return result;
};

sub.on('message', (channel, message) => {
  const index = parseInt(message);
  redisClient.hgetall('values', (err, values) => {
    fib(index, values);
  });
});
sub.subscribe('insert');
