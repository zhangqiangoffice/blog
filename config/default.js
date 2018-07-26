module.exports = {
  port: 8082,
  session: {
    secret: 'z-blog',
    key: 'z-blog',
    maxAge: 20 * 60 * 1000,
    storeTtl: 20 * 60
  },
  storeUrl: 'redis://redis.com:27017',
  storePass: 'password',
  mongodb: 'mongodb://localhost:27017/blog'
}
