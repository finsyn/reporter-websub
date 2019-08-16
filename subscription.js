const { insertSubscription } = require('./store')
const querystring = require('querystring')
const axios = require('axios')
const { subscribeRequestParams } = require('./websub')
const { pipe, then } = require('ramda')

async function createSubscriptionEntry({ topic, hub }) {
  const id = await insertSubscription({
    topic,
    hub: hub,
    createdAt: new Date(),
    mode: 'pending-subscribe'
  })
  return { topic, hub, id }
}

// https://www.w3.org/TR/websub/#subscriber-sends-subscription-request
async function sendSubscribeRequest({ topic, hub, id }) {
  const params = subscribeRequestParams({
    topic: `${topic}.json`,
    id,
    origin: process.env.WEBSUB_CALLBACK_ORIGIN,
    secret: process.env.WEBSUB_SUBSCRIBER_SECRET
  })
  return axios.post(hub, querystring.stringify(params))
}

const createSubscription = pipe(
  createSubscriptionEntry,
  then(sendSubscribeRequest)
)

module.exports = {
  createSubscription,
}
