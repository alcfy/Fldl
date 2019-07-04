const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const collectionRouter = require('./collections');
const productRouter = require('./products');
const dbRouter = require('./databaseAction');
const geoCodingRouter = require('./geocoding');

router = combineRouters(
    rootRouter,
    orderRouter,
    collectionRouter,
    productRouter,
    dbRouter,
    geoCodingRouter
)

module.exports = router;
