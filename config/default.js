module.exports = {
  port: 8082,
  session: {
    secret: 'z-blog',
    key: 'z-blog',
    maxAge: 20 * 60 * 1000,
    storeUrl: 'redis://redis-12019.c53.west-us.azure.cloud.redislabs.com:12019',
    storeTtl: 20 * 60
  },
  storePass: 'password',
  mongodb: 'mongodb://localhost:27017/blog'
}
