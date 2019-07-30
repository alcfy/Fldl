const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const itemList = require ('../util/mainHelper')
const router = Router({
    prefix: '/return'
});

router.get('/requested/uuid', async ctx => {
        db = ctx.db
        code = ctx.query.code
        myRef = db.collection('requestedReturns')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            ctx.body = { "unique":true}
        }
        else{
            ctx.body = { "unique":false}
        }
});

router.get('/requested/exists', async ctx=>{
    order = ctx.query.orderNum
    customerEmail = ctx.query.emailAdd
    db = ctx.db
    myRef = db.collection('requestedReturns')
    ctx.body = {
            'code':'none',
            'exsit':false
        }
        let querySnapshot = await myRef.where('order','==',order).where('email','==',customerEmail).get()
        if (!querySnapshot.empty){
            ctx.body = {"exist":true, 'code':querySnapshot.docs[0].id}
    }
})

router.put('/requested/itemStatus', async ctx=>{
        code = ctx.query.code
        rawItems = ctx.query.items
        db = ctx.db
        let itemsJSON = await JSON.parse(rawItems)
        myRef = db.collection('requestedReturns').doc(code)
        updateFields = myRef.update({items:itemsJSON})
        ctx.body = {"success":true}
})

router.get('/requested/items', async ctx=>{
        code = ctx.query.code
        db = ctx.db
        myRef = db.collection('requestedReturns')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            ctx.body = { "valid":false}
        }
        else{
            await query.forEach(doc => {
                ctx.body = {"res":doc._fieldsProto,"valid":true}
            })
        }
})

router.put('/requested/orderStatus', async ctx=>{
    db = ctx.db
        code = ctx.query.code
        myRef = db.collection('requestedReturns').doc(code)
        let query = await myRef.update({
            order_status: 'cancelled'
        })
        let getDoc = await db.collection('requestedReturns').doc(code).get()
        //console.log(getDoc.data())
        let data = getDoc.data()
        let setDoc = db.collection('history').doc().set(data)
        let deleteDoc = db.collection('requestedReturns').doc(code).delete()

        ctx.body = {'success':true}
})

router.get('/pending/itemList', async ctx=>{
    let fullList = await itemList.getItems(ctx.db);
    ctx.body = fullList
})

router.post('/requested/new', async ctx=>{
        db = ctx.db
        const { shop, accessToken } = getShopHeaders(ctx);
        const rawItems = ctx.query.items
        const orderNum = ctx.query.orderNum
        const date = ctx.query.date
        const code = ctx.query.code
        const email = ctx.query.email
        let itemsJSON = await JSON.parse(rawItems)
        let data = {
            //base information
            code: code,
            email: email,
            shop: shop,
            order: orderNum,
            order_status: 'submitted',
            items: [],
            createdDate: date
        };
        //all items start submitted
        const myStatus = 'submitted'
        for (var i = 0;i<itemsJSON.length;i++){
            data.items.push({"name":itemsJSON[i].name, "price":itemsJSON[i].price, "reason":itemsJSON[i].reason, "variantid":itemsJSON[i].variantid.toString(),"status": myStatus})
        }
        //write to requested returns
        setDoc = db.collection('requestedReturns').doc(code).set(data)
        ctx.body = 'success'
})

router.post('/pending/new', async ctx=>{
    db = ctx.db
    const { shop, accessToken } = getShopHeaders(ctx);
    const rawItems = ctx.query.items
    const orderNum = ctx.query.orderNum
    const date = ctx.query.date
    const code = ctx.query.code
    const email = ctx.query.email
    const originalDate = ctx.query.originalDate
    let itemsJSON = await JSON.parse(rawItems)
        let data = {
            //base information
            code: code,
            email: email,
            shop: shop,
            order: orderNum,
            order_status: 'submitted',
            items: [],
            receivedDate: date,
            createdDate: originalDate
        };
        for (var i = 0;i<itemsJSON.length;i++){
            //write item status with the sorting centre status (correct)
            let myStatus = itemsJSON[i].status
            data.items.push({"name":itemsJSON[i].name, "flag":0, "price":itemsJSON[i].price, "reason":itemsJSON[i].reason, "variantid":itemsJSON[i].variantid.toString(),"status": myStatus})
        }
        //pull from requested returns and then write to pending
            data.order_status = 'pending'
            setDoc = db.collection('pending').doc().set(data)
            //delete
            let receiveDate = (new Date().getMonth()+1)+'/'+ (new Date().getDate()) + '/'+  new Date().getFullYear()
            let processDate = (new Date().getMonth()+1)+'/'+ (new Date().getDate()+1) + '/'+  new Date().getFullYear()
            doc = await db.collection('requestedReturns').doc(code).get()
            //copy basic information
            data = {
            code: doc._fieldsProto.code.stringValue,
            email: doc._fieldsProto.email.stringValue,
            shop: doc._fieldsProto.shop.stringValue,
            items: [],
            order_status: 'complete',
            order: doc._fieldsProto.order.stringValue,
            createdDate:doc._fieldsProto.createdDate.stringValue,
            receivedDate: receiveDate,
            processedDate : processDate,
        }
        //copy over items
        for (var i = 0;i<doc._fieldsProto.items.arrayValue.values.length;i++){
            let temp = doc._fieldsProto.items.arrayValue.values[i]
            tempItem = {
                price: temp.mapValue.fields.price.stringValue,
                name: temp.mapValue.fields.name.stringValue,
                variantid: temp.mapValue.fields.variantid.stringValue,
                reason: temp.mapValue.fields.reason.stringValue,
                status: temp.mapValue.fields.status.stringValue,
                flag: 1
            }
        }
        //actually write
        data.items.push(tempItem)
        //write to history if also writing to pending as it'll end up there anyways. delete from req returns
        let set = db.collection('history').doc().set(data)
        let deleteDoc = db.collection('requestedReturns').doc(code).delete();
          
          ctx.body = 'success'
})


module.exports = router;
