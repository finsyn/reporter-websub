const { applySpec, path, ifElse, pathSatisfies, always, head, pipe,
  map, prop, includes, identity, converge } = require('ramda')
const { publish } = require('finsyn-pubsub')

// Object<mfnNewsItem> -> Object<ActivityData>
const toActivity = applySpec({
  data: applySpec({
    source: always('SE_MFN'),
    title: path(['content', 'title']),
    text: path(['content', 'text']),
    language: path(['properties', 'lang']),
    type: ifElse(
      pathSatisfies(includes('sub:report'), ['properties', 'tags']),
      always('Report'),
      always('Filing')
    ),
    publisherLei: pipe(
      path(['author', 'leis']),
      head
    ),
    publisherName: path(['author', 'name']),
    publishedAt: path(['content', 'publish_date'])
  }),
  attachments: pipe(
    path(['content', 'attachments']),
    map(
      applySpec({
        name: prop('file_title'),
        contentType: prop('content_type'),
        url: prop('url')
      })
    )
  )
})

const publishActivity = pipe(
  toActivity,
  converge(
    publish, [
      always('activity.security.v2'),
      identity,
      always({})
    ]
  )
)

module.exports = {
  toActivity,
  publishActivity
}
