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



 





    return{
        create_user,
        checkUser,
        checkcode,
        getuser

    }
}
