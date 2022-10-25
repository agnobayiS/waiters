module.exports = function waiters(db) {


    async function create_user(names, surnames, emails, code) {

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
                await db.none('insert into WAITER_NAMES (names, surname, email, USER_CODE) values ($1, $2, $3,$4)', [user_name, user_surname, user_email, code])
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

    async function addDays(days, name) {
        let checkDays = Array.isArray(days) ? days : [days]
        let user = name.toUpperCase();
        let getNameId = await db.oneOrNone('select id from waiter_names where names = $1', [user]);

        await db.none('delete from tablereff where NAMES_ID = $1 ', [getNameId.id])
        for (let i = 0; i < checkDays.length; i++) {
            const element = checkDays[i].toUpperCase();

            let day_id = await db.one('select id from  weekdays where day = $1', [element])
            await db.none(`insert into tablereff (names_id, day_id) values($1, $2) `, [getNameId.id, day_id.id])
        }
    }

    async function getAdmin() {

        let data = await db.manyOrNone('select names, day from tablereff join waiter_names on waiter_names.id = tablereff.names_id join weekdays on weekdays.id = tablereff.day_id');
        let days = await db.manyOrNone('select day from weekdays')
        var waiters = []


        for (var day of days) {
            let shift = {
                work_day: day.day,
                waiter: []
            }
            waiters.push(shift)
        }

        for (const days of waiters) {

            for (const working of data) {

                if (days.work_day === working.day) {

                    days.waiter.push(working.names)
                }

            }
        }

        for (const waiter_data of waiters) {
            if (waiter_data.waiter.length < 3) {
                waiter_data.colour = "enough";
            } else if (waiter_data.waiter.length === 3) {
                waiter_data.colour = "good";

            } else if (waiter_data.waiter.length > 3) {
                waiter_data.colour = "many";
            }
        }

        return waiters
    }

    async function checkDays(waiter) {
        let days = await db.many('select day from weekdays')
        let data = await db.manyOrNone(`select DISTINCT day from TABLEREFF
             join WAITER_NAMES on waiter_names.id=tablereff.names_id
             join weekdays on weekdays.id = tablereff.day_id
             where names = $1`, [waiter]);


        for (const weekDay of days) {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                if (weekDay.day === element.day) {
                    weekDay.checked = "checked"
                }
            }

        }

        return days
    }

    async function clearAllData() {

        let clear = await db.none('delete from tablereff;')

        return clear

    }

    return {
        create_user,
        checkUser,
        checkcode,
        getuser,
        addDays,
        getAdmin,
        checkDays,
        clearAllData

    }
}
