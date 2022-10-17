module.exports = function waiters(db){
    

    async function create_user(names, surnames, emails,code) {

        let user_name = names.toUpperCase()
        let user_surname = surnames.toUpperCase()
        let user_email = emails.toUpperCase()
        let nameRegex = /^[a-zA-Z]{3,}$/
        let emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/


        const name = nameRegex.test(user_name);
        const surname = nameRegex.test(user_surname)
        const email = emailRegex.test(user_email)

        
        if (name && surname && email && code) {
            let duplicate = await checkUser(user_name)
        
            if (duplicate) {
                await db.none('insert into WAITER_NAMES (names, surname, email, USER_CODE) values ($1, $2, $3,$4)', [user_name, user_surname, user_email,code])
                return "created a user"
            } 
            else {
                return "duplicate"
            }

        }
    }

    async function checkUser(users) {
        let user = await db.any('select names from WAITER_NAMES where names = $1', [users])
        
        return user.length == 0 ? true : false;
    }
    async function checkcode(code) {
        let user = await db.any('select USER_CODE from WAITER_NAMES where USER_CODE = $1', [code])
        
        return user.length == 0 ? true : false;
    }
    async function getuser(name) {

        let user = await db.manyOrNone('select * from WAITER_NAMES where names = $1', [name])
        return user
    }

    async function addDays (days, name) {
        let checkDays = Array.isArray(days) ? days : [days]
        let user = name.toUpperCase();
        let getNameId =  await db.oneOrNone('select id from waiter_names where names = $1', [user]);

        for (let i = 0; i < checkDays.length; i++) {
            const element = checkDays[i].toUpperCase();
            let day_id = await db.one('select id from  weekdays where day = $1', [element])
            await db.none(`insert into tablereff (names_id, day_id) values($1, $2) `, [getNameId.id, day_id.id])
        }
    }

    async function getAdmin () {

        let data = await db.many('select names, day from tablereff join waiter_names on waiter_names.id = tablereff.names_id join weekdays on weekdays.id = tablereff.day_id') ;
        let days = await db.many('select day from weekdays')
        for (var day of days) {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
               
                if (day.day === element.day) {
                    console.log("match")
                    day.waiter = element.names
                }
                
            }
            
        }
        console.log(days);
        return days
    }



 





    return{
        create_user,
        checkUser,
        checkcode,
        getuser,
        addDays,
        getAdmin

    }
}
