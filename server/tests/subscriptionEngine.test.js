// ponytail: no jest installed in this project, plain-assert self-check instead
// run with: node server/tests/subscriptionEngine.test.js
const assert = require('assert');

const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Payment = require('../models/Payment');
const subscriptionEngine = require('../logic/subscription/subscriptionEngine');

async function testSubscribeUpgradesUserAndRecordsPayment() {
  SubscriptionPlan.findById = async (id) => ({ _id: id, name: 'Pro', price: 999, duration: 30 });

  let capturedPayment = null;
  Payment.create = async (doc) => {
    capturedPayment = doc;
    return { _id: 'payment1', ...doc };
  };

  let capturedUpdate = null;
  User.findByIdAndUpdate = async (id, update) => {
    capturedUpdate = update;
    return {
      _id: id,
      subscription_tier: update.$set.subscription_tier,
      subscription_start: update.$set.subscription_start,
      expiry_date: update.$set.expiry_date
    };
  };

  const result = await subscriptionEngine.subscribe('user1', 'plan1');

  assert.strictEqual(capturedPayment.payment_status, 'success', 'mock payment must be recorded as successful');
  assert.strictEqual(capturedPayment.amount, 999);
  assert.ok(capturedPayment.transaction_id.startsWith('MOCK-'), 'expected a mock transaction id');

  assert.strictEqual(capturedUpdate.$set.subscription_tier, 'Pro');
  const expectedExpiryMs = capturedUpdate.$set.subscription_start.getTime() + 30 * 24 * 60 * 60 * 1000;
  assert.strictEqual(capturedUpdate.$set.expiry_date.getTime(), expectedExpiryMs, 'expiry should be start + plan.duration days');

  assert.strictEqual(result.subscription_tier, 'Pro');
  assert.strictEqual(result.payment_id, 'payment1');
  console.log('subscribe() self-check passed');
}

async function testSubscribeThrowsOnUnknownPlan() {
  SubscriptionPlan.findById = async () => null;

  let threw = false;
  try {
    await subscriptionEngine.subscribe('user1', 'ghost-plan');
  } catch (err) {
    threw = true;
  }
  assert.ok(threw, 'expected subscribe() to throw for an unknown plan');
  console.log('subscribe() unknown-plan self-check passed');
}

async function testExpiredSubscriptionFallsBackToFreeLimits() {
  const expiredUser = {
    subscription_tier: 'Pro',
    expiry_date: new Date(Date.now() - 24 * 60 * 60 * 1000) // expired yesterday
  };
  User.findById = async () => expiredUser;

  const QuizSession = require('../models/QuizSession');
  QuizSession.countDocuments = async () => 1; // already used the Free tier's 1 mock test

  const check = await subscriptionEngine.canStartQuiz('user1', 'mock');
  assert.strictEqual(check.allowed, false, 'expired Pro subscription must be treated as Free tier limits');
  assert.ok(check.reason.startsWith('Free'), 'reason should reflect the effective (Free) tier, not the stale Pro field');
  console.log('expired-subscription self-check passed');
}

async function run() {
  await testSubscribeUpgradesUserAndRecordsPayment();
  await testSubscribeThrowsOnUnknownPlan();
  await testExpiredSubscriptionFallsBackToFreeLimits();
}

run();
