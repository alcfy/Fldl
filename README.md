# Fldl

## Setup
1. Run `npm install`
2. Run `npm dev run`, open another terminal and run ngrok or serveo
3. Create a new app in shopify admin
4. Copy the link that generated by ngrok/serveo, and paste it in the new app that you just created
5. Pick a test store and load the following link into your browser
```
HTTPS://[YOUR_SERVEO_NAME].serveo.net/auth?shop=YOURSHOPIFYSTORE.myshopify.com
```

## Adding new server route
When you need to add a new route for your feature, first check if it should be under a route that already existed, otherwise, create a new file under `routes` which contain a new router and include it in `routes/index.js`.

## Setup a private app for sending request from Postman
Since Postman does not response well with auth verification (`verifyRequest()`), I opt it out, which mean no more access token in Postman. In order to call Shopify API, you will need to create a private app and generate credentials. See [here](https://help.shopify.com/en/api/getting-started/authentication/private-authentication). If you can find a way to verify postman request, please let me know!

After you created the API key and password, do the following:
1. Join the API key and password with a single colon (:).
2. Encode the resulting string in base64 representation.
3. Prepend the base64-encoded string with Basic and a space, an example:
```
Basic NDQ3OGViN2FjMTM4YTEzNjg1MmJhYmQ4NjE5NTZjMTk6M2U1YTZlZGVjNzFlYWIwMzk0MjJjNjQ0NGQwMjY1OWQ=
```
4. Put this key in your request header under `Authorization`. See [POST example](https://github.com/alcfy/Fldl/blob/master/server/routes/products.js#L10).

## Setup .env file
You need to have the following environment variables set
```
SHOPIFY_API_KEY=[YOUR_STORE_API_KEY]
SHOPIFY_API_SECRET_KEY=[YOUR_STORE_API_SECRET_KEY]
SHOP_AUTH=[YOUR_BASIC_PRIVATE_APP_AUTH]
GOOGLE_APPLICATION_CREDENTIALS=[YOUR_PATH_TO_FIREBASE_CREDENTIAL]
DEBUG=1
```
<<<<<<< HEAD
## Structure standard
- `./.env` - contain all environment variables (git ignored)
- `./.secret/` - directory that contain secret files such as Firebase admin key (git ignored)
- `./server/` - directory that contain all backend server code
  - `./server/routes` - all routers should go here
- `./client` - directory that contain all frontend code
## Merge
Whenever you finish a task, merge it in `testing` branch.
=======

## Setup serveo
In client/pages/config.js, add the name of your serveo link.
```
export const serveo_name = [YOUR_SERVEO_NAME];
```
>>>>>>> Get-It-Today
