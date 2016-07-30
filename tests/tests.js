import {parseDate, embeddConstructor} from '../src/embedd'
import redditConstructor from '../src/reddit'
import hnConstructor from '../src/hn'
import test from 'tape'

const spec = {
  url: 'https://www.eff.org/deeplinks/2015/10/closing-loopholes-europes-net-neutrality-compromise',
  limit: 5
}

const embeddSpec = {
  submitUrl: 'test',
  dataFmt: function () {},
  commentFmt: function () {},
  threadFmt: function () {}
}

function extend (o1, o2) {
  let result = {}

  for (let key in o1) { result[key] = o1[key] }
  for (let key in o2) { result[key] = o2[key] }

  return result
}

function isBoolean (x) {
  return typeof x === 'boolean'
}

function verifyComments (obj) {
  return !!(obj.comments && obj.score && obj.threads)
}

test('parseDate', t => {
  t.false(parseDate(), 'should return false if no value is passed')

  t.test('should return false if time passed is in the future', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now + 50)

    st.false(d)
    st.end()
  })

  t.test('should return "a few seconds ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now)

    st.equal(d, 'a few seconds ago')
    st.end()
  })

  t.test('should return "1 minute ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now - 60)

    st.equal(d, '1 minute ago')
    st.end()
  })

  t.test('should return "2 minutes ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now - 120)

    st.equal(d, '2 minutes ago')
    st.end()
  })

  t.test('should return "1 hour ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now - 3600)

    st.equal(d, '1 hour ago')
    st.end()
  })

  t.test('should return "2 hours ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now - 7200)

    st.equal(d, '2 hours ago')
    st.end()
  })

  t.test('should return "1 day ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now - 86400)

    st.equal(d, '1 day ago')
    st.end()
  })

  t.test('should return "2 days ago"', st => {
    let now = new Date().getTime() / 1000
    let d = parseDate(now - 172800)

    st.equal(d, '2 days ago')
    st.end()
  })

  t.end()
})

test('embeddConstructor', t => {
  t.test('should throw an error if no spec object is passed', st => {
    function embeddTest () {
      return embeddConstructor()
    }

    st.throws(embeddTest, 'No spec object has been specified')
    st.end()
  })

  t.test('should throw an error if the spec object doesnt have a dataFmt method', st => {
    function embeddTest () {
      let testSpec = extend({}, embeddSpec)
      delete testSpec.dataFmt

      return embeddConstructor(testSpec)
    }

    st.throws(embeddTest, 'dataFmt method isnt defined')
    st.end()
  })

  t.test('should throw an error if the spec object doesnt have a submitUrl property', st => {
    function embeddTest () {
      let testSpec = extend({}, embeddSpec)
      delete testSpec.submitUrl

      return embeddConstructor(testSpec)
    }

    st.throws(embeddTest, 'submitUrl isnt defined')
    st.end()
  })

  t.test('should throw an error if the spec object doesnt have a commentFmt method', st => {
    function embeddTest () {
      let testSpec = extend({}, embeddSpec)
      delete testSpec.commentFmt

      return embeddConstructor(testSpec)
    }

    st.throws(embeddTest, 'commentFmt method isnt defined')
    st.end()
  })

  t.test('should throw an error if the spec object doesnt have a threadFmt method', st => {
    function embeddTest () {
      let testSpec = extend({}, embeddSpec)
      delete testSpec.threadFmt

      return embeddConstructor(testSpec)
    }

    st.throws(embeddTest, 'threadFmt method isnt defined')
    st.end()
  })

  t.end()
})

test('redditConstructor', t => {
  let reddit = redditConstructor(spec)

  t.test('should throw an error if no url has been specified', st => {
    function redditTest () {
      return redditConstructor()
    }

    st.throws(redditTest, 'The Reddit constructor requires a spec object')
    st.end()
  })

  reddit.hasComments((err, data) => {
    t.false(err, 'should be no error')
    t.assert(isBoolean(data), 'should have a hasComments method that accepts a callback')
  })

  reddit.getComments((err, data) => {
    t.false(err, 'should be no error')
    t.assert(verifyComments(data), 'should have a getComments method that returns a valid data object')
  })

  t.end()
})

test('hnConstructor', t => {
  let hn = hnConstructor(spec)

  t.test('should throw an error if no url has been specified', st => {
    function hnTest () {
      return hnConstructor()
    }

    st.throws(hnTest, 'The HN constructor requires a spec object')
    st.end()
  })

  hn.hasComments((err, data) => {
    t.false(err, 'should be no error')
    t.assert(isBoolean(data), 'should have a has Comments method that accepts a callback')
  })

  hn.getComments((err, data) => {
    t.false(err, 'should be no error')
    t.assert(verifyComments(data), 'should ahve a getComments method that returns a valid data object')
  })

  t.end()
})
