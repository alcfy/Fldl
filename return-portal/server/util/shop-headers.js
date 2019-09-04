const { Error } = require("../error");
// When return empty object means either shop and token are incorrect and should return 401 bad request
async function getShopHeaders(ctx) {
  const { cookies } = ctx;
  const shop = cookies.get("shop_id") || ctx.query.shop;
  if (!shop) {
    ctx.throw(401, Error.invalidShop);
    return;
  }
  const accessToken =
    cookies.get("accessToken") || ctx.accessToken || ctx.header["accessToken"];
  if (!accessToken) {
    ctx.throw(401, Error.invalidAccessToken);
  }

  return {
    shop: shop,
    accessToken: accessToken
  };
}

module.exports = { getShopHeaders };
