const { updateSubscription, getSubscription } = require('./store')
const app = require('express')()
const { tap, pipe, prop, zipObj, props } = require('ramda')

const getParams = pipe(
  prop('query'),
  tap(console.log),
  props(['hub.mode', 'hub.topic', 'hub.challenge']),
  zipObj(['hubMode', 'hubTopic', 'hubChallenge'])
)

app.get('/s/:id', async (req, res) => {
  const id = req.params.id
  const entry = await getSubscription(id)
  if (!entry) res.sendStatus(404)
  const { hubMode, hubTopic, hubChallenge } = getParams(req)
  if (hubTopic !== entry.topic) res.sendStatus(404)
  entry.mode = hubMode
  await updateSubscription(id, entry)
  res.status(200).send(hubChallenge)
})

// const validRoute = pipe(
//   split('/'),
//   zipWith([
//     equals('s'),
//     test(/^\d+$/)
//   ])
// )

// (ExpressReq, [Object<di>]) -> Promise<Object<apiResponse>>
async function callbackGet(req, { storeGetter = getSubscription }) {
  const [ route, id ] = req.path.split('/')
  console.log(id)
  return { response: entry, status: 200 }
}

module.exports = app
