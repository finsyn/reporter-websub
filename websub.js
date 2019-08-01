const { prop, pipe, always, props, join, applySpec } = require('ramda')

const callbackUrl = pipe(
  props(['origin', 'id']),
  join('/s/')
)

const subscribeRequestParams = applySpec({
  'hub.callback': callbackUrl,
  'hub.topic': prop('topic'),
  'hub.mode': always('subscribe'),
  'hub.secret': prop('secret')
})

module.exports = {
  subscribeRequestParams
}
