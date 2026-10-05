# sails-hook-resque
[![Build Status](https://travis-ci.org/edy/sails-hook-resque.svg)](https://travis-ci.org/edy/sails-hook-resque)

Delayed tasks in Sails.js app. Using node-resque

## Configuration
All configuration options are available in [lib/defaults.js](lib/defaults.js)

`stuckWorkerTimeout` is passed to the node-resque scheduler. It controls the
maximum age of a worker's heartbeat in milliseconds, not its job runtime.
The default remains one hour; use `false` to disable automatic cleanup.

```javascript
// config/resque.js
module.exports.resque = {
  stuckWorkerTimeout: 5 * 60 * 1000
};
```

Cleanup requires a running scheduler. A worker classified as stuck is removed
from the registry and its current job, if any, is moved to the failed queue.
This option does not add startup cleanup or change shutdown behavior.

## Tests
Run `npm run test:unit` for isolated tests without Redis or a Sails application.
The existing `npm test` suite also boots Sails and uses Redis.

## Queue usage
Hook setup queue service in your Sails.js application

Your Sails.js application will contain `sails.resque.queue` object that is [NR.queue](https://github.com/taskrabbit/node-resque#queue-management) and have all it's methods.

**Usage in application** In your application:

Create a task in `api/jobs/add.js` :

```javascript
module.exports = {
  plugins: [ 'JobLock' ],
  pluginOptions: {
    jobLock: {},
  },
  perform: async (a, b) => {
    const answer = a + b;
    await new Promise((r) => setTimeout(r, 1000));
    return answer;
  },
};
```

And queue it in your application:
```javascript
sails.resque.queue.enqueue('math', 'add', [1, 2]);
```
