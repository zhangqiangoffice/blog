module.exports = {
  port: 8083,
  session: {
    secret: 'z-blog',
    key: 'z-blog',
    maxAge: null,
    storeTtl: 20 * 60
  },
  storeUrl: 'redis://redis.com:27017',
  storePass: 'password',
  mongodb: 'mongodb://localhost:27017/blog'
}
