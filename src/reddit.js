import {decode, parseDate, embeddConstructor} from './embedd'

export default function redditConstructor (spec) {
  if (!spec) { throw new Error('The Reddit constructor requires a spec object') }

  const {url, limit} = spec
  const embeddSpec = {}

  embeddSpec.base = 'https://www.reddit.com'
  embeddSpec.searchQs = '/search.json?q=url:'
  embeddSpec.query = embeddSpec.base + embeddSpec.searchQs + url
  embeddSpec.submitUrl = 'https://www.reddit.com/submit'
  embeddSpec.limit = limit

  embeddSpec.dataFmt = (response, cb) => {
    response.hits = response.data.children.map(x => {
      x = x.data
      return x
    })
    cb(null, response)
  }

  embeddSpec.commentFmt = (comment) => {
    return {
      author: comment.author,
      author_link: 'https://www.reddit.com/user/' + comment.author,
      body_html: decode(comment.body_html),
      created: parseDate(comment.created_utc),
      id: comment.id,
      score: comment.score,
      replies: null,
      hasReplies: false,
      isEven: function () { return this.depth % 2 === 0 },
      lowScore: function () { return this.score < 0 }
    }
  }

  embeddSpec.threadFmt = (thread) => {
    const childrenFmt = (child) => {
      child.points = child.score
      if (child.replies) {
        child.children = child.replies.data.children.map(x => {
          x = x.data
          if (x.replies) {
            x.children = childrenFmt(x)
          }
          return x
        })
      }
      return child
    }

    const op = thread[0].data.children[0].data
    op.points = op.score
    op.children = thread[1].data.children.map(x => {
      x = x.data
      return childrenFmt(x)
    })
    return op
  }

  return embeddConstructor(embeddSpec)
}
