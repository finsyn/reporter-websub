const t = require('tap')
const { callbackGet } = require('./hook')

t.test(async t => {
  const req = {
    path: '/s/12345'
  }
  const res = {}
  const storeGetter = (id) => (id === '12345') ?
    Promise.resolve({
      status: 'PENDING'
    }) :
    Promise.resolve(null)
  const { status, response } = await callbackGet(req, { storeGetter })
  console.log(status, response)
  t.done()
})
