'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var NR = require('node-resque');
var initializeScheduler = require('../../lib/init/initScheduler');
var defaults = require('../../lib/defaults').__configKey__;

describe('Scheduler configuration (unit)', function() {
  var scheduler;
  var constructor;
  var sails;

  beforeEach(function() {
    scheduler = {
      connect: sinon.stub().returns(Promise.resolve()),
      on: sinon.stub(),
      start: sinon.stub()
    };
    constructor = sinon.stub(NR, 'Scheduler').returns(scheduler);
    sails = { resque: {}, log: { error: sinon.stub() } };
  });

  afterEach(function() {
    constructor.restore();
  });

  it('passes a configured heartbeat timeout to node-resque', async function() {
    var config = { connection: { host: 'test-only' }, autoStart: { scheduler: true }, stuckWorkerTimeout: 300000 };
    await initializeScheduler(sails, config)();
    expect(constructor.firstCall.args[0]).to.deep.equal({ connection: config.connection, stuckWorkerTimeout: 300000 });
    sinon.assert.calledOnce(scheduler.connect);
    sinon.assert.calledOnce(scheduler.start);
    expect(sails.resque.scheduler).to.equal(scheduler);
  });

  it('preserves false to disable heartbeat cleanup', async function() {
    await initializeScheduler(sails, { connection: {}, autoStart: { scheduler: false }, stuckWorkerTimeout: false })();
    expect(constructor.firstCall.args[0].stuckWorkerTimeout).to.equal(false);
    sinon.assert.notCalled(scheduler.start);
  });

  it('retains the one-hour default', async function() {
    expect(defaults.stuckWorkerTimeout).to.equal(60 * 60 * 1000);
    await initializeScheduler(sails, defaults)();
    expect(constructor.firstCall.args[0].stuckWorkerTimeout).to.equal(3600000);
  });

  it('leaves a missing timeout undefined so node-resque applies its own default', async function() {
    await initializeScheduler(sails, { connection: {}, autoStart: { scheduler: false } })();
    expect(constructor.firstCall.args[0].stuckWorkerTimeout).to.equal(undefined);
    expect(sails.resque.scheduler).to.equal(scheduler);
  });
});
