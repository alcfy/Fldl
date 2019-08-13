const serveoname = '04071318.serveo.net'
const rp = require('request-promise');
const { api_link } = require('../default-shopify-api.json');
const emailHelper = require('./emailHelper')
const expiredHelper = require('./expiredHelper')
const inv = require ('./editInventory')
const mainHelper = require('./mainHelper')

//get rid of anything that's been in orders for over 7 days
async function checkExpired(db){
    //clear items that have been in warehouse for 7+ days, mark returning and pull inventory
    expiredHelper.clearExpiredItems(db)
    //clear return requests that have been in system for 7+ days
    expiredHelper.clearExpiredOrders(db)
}

//main function, gets handles the orders that are in pending
async function mainReport(dbIn){
    db = dbIn
        //pull all the items from pending
    let items = await mainHelper.getItems(dbIn)
        //break down items into items being resold and items being refunded (not mutually exclusive)
    let {acceptedList, refundList, returningList} = await mainHelper.breakdown(db, items)
        //write any items directly to returning
    for (var i =0;i<returningList.length;i++){
        addItem(returningList[i],'returning',db)
    }
        //cancel duplicates to get accurate quantities
    acceptedList = await mainHelper.combine(acceptedList)
        //update inventory for accepted items
    await updateInventory(acceptedList, dbIn)
        //sort items, ultimately send email to brand about what new items were received today
    //mainHelper.sortNewItems(acceptedList, dbIn)
        //sort items, ultimately send email to brand about who they need to refund
    //mainHelper.sortRefundItems(refundList, dbIn)   
}

//notify of all items marked returning so we know when to send shipments back
async function returningReport(dbIn){
    let returningList = []
    db = dbIn
    myRef = db.collection('items')
    let query = await myRef.get()
    await query.forEach(async doc => {
        if (doc._fieldsProto.status.stringValue == 'returning'){
            tempItem= {
                variantid: doc._fieldsProto.variantid.stringValue,
                name : doc._fieldsProto.name.stringValue,
                store : doc._fieldsProto.store.stringValue,
                quantity: 1
            }
            returningList.push(tempItem)
        }
    });
    returningList = mainHelper.combine(returningList)
    //console.log(returningList)
    console.log('the list is here:')
}


//wipe pending, everything has been dealt with by this point
async function clearPending(dbIn){
    db = dbIn
    let batch = db.batch()
    let myRef = db.collection('pending')
    let query = await myRef.get()
    await query.forEach(async doc =>{
        batch.delete(doc.ref)
    })
    batch.commit();
}

////////////////////////////////////////////////////////////////////

//update inv for reselling items
async function updateInventory(items, dbIn){
    db = dbIn
    let blockedList = []
    for (var i = 0;i<items.length;i++){
        //get information for active item
            //let idActive = items[i].variantidGIT CHANGE IT TO THIS ONE WHEN WE ACTUALLY HAVE DUPLICATES
        let idActive = items[i].variantid
        let storeActive = items[i].store
        //get access token for specific store
        let {accessToken, torontoLocation} = await inv.getAccessToken(db,storeActive)
        let invId = await inv.getInvID(storeActive, idActive, accessToken)
        addItem(items[i], 'reselling', db)
        inv.increment(items[i].quantity,torontoLocation,invId,storeActive)
        }
    emailHelper.sendBlockedListEmail(blockedList)
}

//add item to items database
async function addItem(item, status, dbIn){
    let currentDate = expiredHelper.getCurrentDate()
    db = dbIn
    //efficiency
    let batch = db.batch()
    let data = {
        name: item.name,
        variantid: item.variantid,
        variantidGIT: item.variantidGIT,
        productid: item.productid,
        productidGIT: item.productidGIT,
        store: item.store,
        status: status,
        dateProcessed: currentDate,
        };
        //create multiple copies of item based on quantity
        for (var i = 0;i<item.quantity;i++){
            setDoc = db.collection('items').doc()
            batch.set(setDoc,data)
        }
        //commit batch
    batch.commit()
}

module.exports = {mainReport, clearPending, checkExpired, returningReport}
