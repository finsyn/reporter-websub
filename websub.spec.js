const t = require('tap')
const { subscribeRequestParams } = require('./websub')

t.test(t => {
  const mock = {
    origin: 'http://test.com',
    id: '123',
    topic: '/test.json',
    secret: 'testSecret'
  }
  const params = subscribeRequestParams(mock)
  console.log(params)
  t.match(
    params,
    {
      'hub.callback': 'http://test.com/s/123',
      'hub.mode': 'subscribe',
      'hub.topic': '/test.json',
      'hub.secret': 'testSecret'
    }
  )
  t.done()
})
