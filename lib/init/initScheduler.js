'use strict';

var NR = require('node-resque');

module.exports = function(sails, config, jobs) {
  /**
   * Initialize resque scheduler
   */
  async function initScheduler() {
    const scheduler = new NR.Scheduler({
      connection: config.connection,
      stuckWorkerTimeout: config.stuckWorkerTimeout
    });

    try {
      await scheduler.connect();
      scheduler.on('error', function(error) {
        sails.log.error(error);
      });
      if (config.autoStart.scheduler) {
        scheduler.start();
      }
      sails.resque.scheduler = scheduler;
    } catch (err) {
      sails.log.error('sails-hook-resque failed initializing scheduler.', err);
    }
  }

  return initScheduler;
};
