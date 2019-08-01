const { insertSubscription } = require('./store')

async function createSubscription({ topic, hub }) {
  const id = await insertSubscription({
    topic,
    hub,
    createdAt: new Date(),
    mode: 'pending-subscribe'
  })
  return id 
}

async function subscribe({ topic, hub, id }) {
  return 'OK'
}

module.exports = {
  createSubscription
}
