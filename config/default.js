module.exports = {
  port: 8082,
  session: {
    secret: 'z-blog',
    key: 'z-blog',
    maxAge: 15 * 60 * 1000
  },
  mongodb: 'mongodb://localhost:27017/blog'
}
