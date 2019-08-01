const { updateSubscription, getSubscription } = require('./store')
const express = require('express')
const { path, tap, pipe, prop, zipObj, props } = require('ramda')
const crypto = require('crypto')

const app = express()
app.use(express.json())

// ExpressReq -> Object<hubVerificationParams>
const getParams = pipe(
  prop('query'),
  tap(console.log),
  props(['hub.mode', 'hub.topic', 'hub.challenge']),
  zipObj(['hubMode', 'hubTopic', 'hubChallenge'])
)

// ExpressReq -> String<subscriptionId>
const getId = path(['params', 'id'])

// Incoming hub intent verification
// ---------------------------------
// https://www.w3.org/TR/websub/#x5-3-hub-verifies-intent-of-the-subscriber
//
app.get('/s/:id', async (req, res) => {
  console.log(`incoming verification request from hub: ${JSON.stringify(req.params)}`)
  const id = getId(req) 
  const entry = await getSubscription(id)
  if (!entry) return res.sendStatus(404)
  const { hubMode, hubTopic, hubChallenge } = getParams(req)
  if (hubTopic !== entry.topic) return res.sendStatus(404)
  entry.mode = hubMode
  await updateSubscription(id, entry)
  res.status(200).send(hubChallenge)
})

// Incoming content from hub  
// -------------------------
// https://www.w3.org/TR/websub/#content-distribution
//
app.post('/s/:id', async (req, res) => {
  const id = getId(req) 
  const entry = await getSubscription(id)
  if (!entry) return res.sendStatus(410)
  // acknowledge message as soon as possible
  res.sendStatus(200)
  // verify X-Hub-Signature header 
  const [ algo, hmacHub ] = req.headers['x-hub-signature'].split('=')
  console.log(algo, hmacHub)
  const hmac = crypto.createHmac(algo, process.env.WEBSUB_SUBSCRIBER_SECRET)
  // not sure if smart to use middlware to deserialize, serialize back and forth here
  // GCF provides an unparsed body as well
  const rawBody = req.rawBody || JSON.stringify(req.body)
  hmac.update(rawBody, 'utf-8')

  // TODO: parse payload and emit Activity PubSub Message if signature is valid
  if (hmac.digest('hex') === hmacHub) {
    console.log('valid signature')
  }
  else {
    console.warn('invalid signature')
  }
  console.log(req.body)
})

module.exports = app
