const { createSubscription } = require('./subscription')
const callbackApp = require('./callback')

const onCreateSubscription = createSubscription 

module.exports = {
  onCallBack: callbackApp,
  onCreateSubscription
}
