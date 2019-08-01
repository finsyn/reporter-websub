const {Datastore} = require('@google-cloud/datastore')
const { always, constructN, prop, pipe, head, path } = require('ramda')

// DBResponse -> Integer<dbId>
const getKeyId = pipe(
  prop('mutationResults'),
  head,
  path(['key', 'path']),
  head,
  prop('id')
)

const datastore = constructN(0, Datastore) 
const kind = always('WebSubSubscription')

// Object<subscription> -> Promise<Integer<dbId>>
async function insertSubscription({ topic, hub, status, createdAt }) {
  const ds = datastore()
  const key = ds.key(kind())
  const [result] = await ds.insert({
    key,
    data: {
      createdAt,
      topic,
      hub,
      status
    }
  })
  return getKeyId(result) 
}

async function getSubscription(id) {
  const ds = datastore()
  const key = ds.key([kind(), parseInt(id)])
  const [result] = await ds.get(key)
  return result 
}

module.exports = {
  insertSubscription,
  getSubscription
}
