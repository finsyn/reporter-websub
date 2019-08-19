const t = require('tap')
const { toActivity } = require('./activity') 
const mock = require('./mocks/newsitem.json')

t.test(t => {
  const { data, attachments } = toActivity(mock)
  t.similar(
    data,
    {
      type: 'Report',
      category: 'SemiAnnual',
      publisherLei: '54930047Z8TEBJTKYX74',
      title: 'New strategic partnerships within Digital Identity and Mobile Devices',
      language: 'en',
      publisherName: 'Precise Biometrics',
      source: 'SE_MFN',
      publishedAt: '2019-08-16T06:00:00Z'
    }
  )
  t.type(data.text, 'string')
  t.similar(
    attachments,
    [
      {
        url: 'https://storage.mfn.se/537ee137-1668-49cf-9a57-dcf8f2bc57f7',
        name: 'PB Q2 2019 ENG',
        contentType: 'application/pdf'
      }
    ]
  )

  t.done()
})




