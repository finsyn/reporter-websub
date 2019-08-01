const { createSubscription } = require('./subscription')
const callbackApp = require('./callback')

// const apiRoutes = {
//   'GET': callbackGet
// }

// async function onCallBack (req, res) {
//   const handler = apiRoutes[req.method] 
//   if (!handler) res.send(405)
//   const { response, status } = await handler(req)
//   res.send(status)
// }

const onCreateSubscription = createSubscription 

module.exports = {
  onCallBack: callbackApp,
  onCreateSubscription
}
