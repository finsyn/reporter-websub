const { updateSubscription, getSubscription } = require('./store')
const express = require('express')
const { path, tap, pipe, prop, zipObj, props } = require('ramda')
const crypto = require('crypto')
const { publishActivity } = require('./activity')
const to = require('./to')

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
  contentType = req.headers['content-type']
  if (contentType != 'application/json') {
    console.log(`cant handle this content type: ${contentType}`)
    res.sendStatus(200)
    return Promise.resolve() 
  }
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
    console.log(req.body)
    const [err, messageId] = await to(publishActivity(req.body))
    if(err) console.error(err) 
    else console.log(`published activity message: ${messageId}`)
  }
  else {
    console.warn('invalid signature')
  }
  // we should acknowledge message as soon as possible but need to do
  // processing first because GCF shuts down after response has been sent
  // TODO: figure out way to send response preemptively
  res.sendStatus(200)
  return Promise.resolve()
})

module.exports = app
