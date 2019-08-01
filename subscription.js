const { insertSubscription } = require('./store')

async function createSubscription({ topic, hub }) {
  const id = await insertSubscription({
    topic,
    hub,
    createdAt: new Date(),
    status: 'PENDING'
  })
  return id 
}

async function subscribe({ topic, hub, id }) {
  return 'OK'
}

module.exports = {
  createSubscription
}
