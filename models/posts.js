const Post = require('../lib/mongo').Post
const marked = require('marked')

// 将post的content从markdown转换成html
Post.plugin('contentToHtml', {
    afterFind: posts => {
        return posts.map(post => {
            post.content = marked(post.content)
            return post
        })
    },
    afterFindOne: post => {
        if (post) {
            post.content = marked(post.content)
        }
        return post
    }
})
module.exports = {
    // 创建一篇文章
    create: function create(post) {
        return Post.create(post).exec()
    },

    // 通过文章id获取一篇文章
    getPostById: postId => {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .addCreatedAt()
            .contentToHtml()
            .exec()
    },

    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts: author => {
        const query = {}
        if (author) {
            query.author = author
        }
        return Post
            .find(query)
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: -1 })
            .addCreatedAt()
            .contentToHtml()
            .exec()
    },

    // 通过文章id给pv（点击率）加1
    incPv: postId => {
        return Post
            .update({ _id: postId }, { $inc: { pv: 1 } })
            .exec()
    },

    // 通过文章id获取一篇原生文章（编辑文章）
    getRawPostById: postId => {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .exec()
    },

    // 通过文章 id 更新一篇文章
    updatePostById: (postId, data) => {
        return Post.update({ _id: postId }, { $set: data }).exec()
    },

    // 通过文章 id 删除一篇文章
    delPostByd: postId => {
        return Post.deleteOne({ _id: postId }).exec()
    },
}

