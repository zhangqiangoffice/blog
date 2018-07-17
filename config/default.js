module.exports = {
  port: 8082,
  session: {
    secret: 'Z-blog',
    key: 'Z-blog',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/blog'
}
