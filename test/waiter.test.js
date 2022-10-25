const assert = require('assert');
const waiter = require('../waitersDB');
const pgPromise = require('pg-promise');
const { default: ShortUniqueId } = require('short-unique-id');
const pgp = pgPromise({})



const local_database_url = 'postgres://siyabonga:siya@localhost:5432/waiters_app';
const connectionString = process.env.DATABASE_URL || local_database_url;

const db = pgp(connectionString);


describe("waiters database test", async function () {



    beforeEach(async function () {
        
        await db.none('delete from tablereff');
    });


    it("should allow a user to signup", async function () {
        let waiters_data = waiter(db)
        const uid = new ShortUniqueId({ length: 6 });
        code = uid();

        await waiters_data.create_user("Zola", "Bayo", "zola@gmail.com", code)
        let find_user = await waiters_data.checkUser("zola")
        
        assert.equal(true, find_user)
    })
   

    it("should be able to check if the user has an account", async function () {
        let waiters_data = waiter(db)

        await waiters_data.checkUser("Zola")
        let find_user = await waiters_data.checkUser("zola")
    
        assert.equal(true, find_user)
    })

    it("should be able to check if the user dose not have an account", async function () {
        let waiters_data = waiter(db)

        await waiters_data.checkUser("thole")
        let find_user = await waiters_data.checkUser("thole")
    
        assert.equal(true, find_user)
    })
    it("should be able to check if the usercode is not valid", async function () {
        let waiters_data = waiter(db)

        await waiters_data.checkcode("Xxa1mY")
        let find_user = await waiters_data.checkcode("Xxa1mY")
    
        assert.equal(false, find_user)
    })
    it("should be able to check if the usercode is valid", async function () {
        let waiters_data = waiter(db)

        await waiters_data.checkcode("BgoGSZ")
        let find_user = await waiters_data.checkcode("BgoGSZ")
    
        assert.equal(true, find_user)
    })

    it("should be able to add days if the user has an account", async function () {
        let waiters_data = waiter(db)

        await waiters_data.addDays("TUESDAY","SIYABONGA")
        let find_user = await waiters_data.getAdmin()
    
        assert.deepEqual([
            { work_day: 'MONDAY', waiter: [], colour: 'enough' },
            { work_day: 'TUESDAY', waiter: [ 'SIYABONGA' ], colour: 'enough' },
            { work_day: 'WEDNESDAY', waiter: [], colour: 'enough' },
            { work_day: 'THURSDAY', waiter: [], colour: 'enough' },
            { work_day: 'FRIDAY', waiter: [], colour: 'enough' },
            { work_day: 'SATURDAY', waiter: [], colour: 'enough' },
            { work_day: 'SUNDAY', waiter: [], colour: 'enough' }
          ], find_user)
    })
    it("should be clear all data if resert is pressed", async function () {
        let waiters_data = waiter(db)

        await waiters_data.addDays("TUESDAY","SIYABONGA")
        let find_user = await waiters_data.clearAllData()
    
        assert.deepEqual(null, find_user)
    })
    


    after(async function () {
        await db.none('Truncate tablereff');
    })
})