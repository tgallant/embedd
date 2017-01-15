import async from 'async'
import axios from 'axios'

export function decode (html) {
  if (!html) { return false }

  const txt = document.createElement('textarea')
  txt.innerHTML = html

  return txt.value
}

export function parseDate (unix) {
  const now = new Date().getTime() / 1000

  if (!unix || unix > now) return false

  const seconds = now - unix
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days === 1) { return '1 day ago' }
  if (days > 0) { return days + ' days ago' }
  if (hours === 1) { return '1 hour ago' }
  if (hours > 0) { return hours + ' hours ago' }
  if (minutes === 1) { return '1 minute ago' }
  if (minutes > 0) { return minutes + ' minutes ago' }

  return 'a few seconds ago'
}

export function embeddConstructor (spec) {
  if (!spec) { throw new Error('No spec object has been specified') }
  if (!spec.submitUrl) { throw new Error('submitUrl isnt defined') }
  if (!spec.dataFmt) { throw new Error('dataFmt method isnt defined') }
  if (!spec.commentFmt) { throw new Error('commentFmt method isnt defined') }
  if (!spec.threadFmt) { throw new Error('threadFmt method isnt defined') }
  if (spec.limit === 0) { spec.limit = null }

  const embedd = {}
  const cache = {}

  function get (url, cb) {
    if (!url) { throw new Error('No URL has been specified') }

    if (cache[url]) {
      cb(null, cache[url])
      return
    }

    axios.get(url).then(res => {
      cache[url] = res.data
      cb(null, res.data)
    }).catch(cb)
  }

  function threadUrl ({ sub, id }) {
    if (sub && id) {
      return spec.base + '/r/' + sub + '/comments/' + id + '.json'
    }

    if (!sub && id) {
      return spec.base + id
    }

    return false
  }

  function getThreads (data, cb) {
    const activeThreads = data.hits.filter(x => {
      return !!x.num_comments
    })

    async.map(activeThreads.slice(0, 10), ({id, subreddit}, callback) => {
      if (id === 'undefined') { throw new Error('No ID specified') }

      const url = threadUrl({ sub: subreddit, id: id })

      get(url, callback)
    }, cb)
  }

  function commentConstructor ({ comment, op, depth }) {
    const cdepth = depth || 0
    const c = spec.commentFmt(comment)

    c.depth = cdepth
    c.subreddit = op.subreddit

    if (op.permalink) {
      c.permalink = spec.base + op.permalink
      c.thread = spec.base + op.permalink + comment.id
    }

    if (comment.children && comment.children.length > 0) {
      const nxtDepth = cdepth + 1

      c.hasReplies = true
      c.replies = comment.children.reduce((arr, r) => {
        if (r.author) {
          arr.push(commentConstructor({ comment: r, op: op, depth: nxtDepth }))
        }

        return arr
      }, [])

      c.loadMore = c.replies.length > 4
    }

    return c
  }

  function parseComments (threads, cb) {
    const cs = threads.map(x => {
      const op = spec.threadFmt(x)
      const comments = op.children.reduce((arr, c) => {
        if (c.author) {
          arr.push(commentConstructor({ comment: c, op: op }))
        }

        return arr
      }, [])
      return { op: op, comments: comments }
    })
    cb(null, cs)
  }

  function mergeComments (comments, cb) {
    const merge = (score, arr, index) => {
      if (index > comments.length - 1) {
        return {
          score: score,
          threads: comments.length,
          comments: arr,
          multiple: function () { return this.threads > 1 }
        }
      }
      const data = comments[index]
      const newScore = score += data.op.points
      const newComments = arr.concat(data.comments)

      return merge(newScore, newComments, index + 1)
    }

    const merged = merge(0, [], 0)
    const sorted = merged.comments.sort((a, b) => {
      return b.score - a.score
    })

    const limit = spec.limit || sorted.length

    merged.comments = sorted.slice(0, limit)
    merged.next = sorted.slice(limit)
    merged.hasMore = !!merged.next.length

    cb(null, merged)
  }

  embedd.submitUrl = spec.submitUrl

  embedd.hasComments = (cb) => {
    async.waterfall([
      async.apply(get, spec.query),
      spec.dataFmt
    ], (err, data) => {
      if (err) { throw new Error(err) }

      const threads = data.hits.filter(x => {
        return !!x.num_comments
      })

      cb(null, !!threads.length)
    })
  }

  embedd.getComments = (cb) => {
    async.waterfall([
      async.apply(get, spec.query),
      spec.dataFmt,
      getThreads,
      parseComments,
      mergeComments
    ], cb)
  }

  return embedd
}
