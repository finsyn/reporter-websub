const { applySpec, path, ifElse, pathSatisfies, always, head, pipe,
  sortBy, split, length, map, prop, includes, identity, converge, __,
  is, filter, find, test, last, reduce, propOr } = require('ramda')
const { publish } = require('finsyn-pubsub')

const tagTree = {
  sub: {
    ci: {
      other: 'Other',
      staff: 'StaffChange',
      gm: 'GeneralMeeting',
      calendar: 'Calendar',
      nomination: 'Nomination',
      sales: 'Sale',
      sales: {
        order: 'SaleOrder',
      }
    },
    ca: {
      shares: 'Shares',
      ma: 'MergerAcquisition',
      ipo: 'Ipo',
      prospectus: 'Prospectus',
    },
    report: {
      annual: 'Yearly',
      interim: {
        default: 'Quarterly',
        q1: 'Quarterly',
        q2: 'SemiAnnual',
        q3: 'Quarterly',
        q4: 'EndReport'
      }
    }
  }
}

const tagsToCategory = pipe(
  path(['properties', 'tags']),
  filter(test(/^sub:/)),
  sortBy(pipe(split(':'), length)),
  last,
  split(':'),
  reduce((dict, node) => dict[node], tagTree),
  ifElse(
    is(Object),
    propOr('Unknown', 'default'),
    identity
  )
)

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
    category: tagsToCategory,
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
