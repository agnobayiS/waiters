module.exports = function waiters(waiterRouts) {

    const { default: ShortUniqueId } = require('short-unique-id');
    const uid = new ShortUniqueId({ length: 6 });

    async function home(req, res) {

        res.render("login", {

        })

    }

    async function login (req, res) {

        let user_name = req.body.name
        let code = req.body.code
        let user = user_name.toUpperCase()
    
    
        let validate = await waiterRouts.checkcode(code)
        let validate2 = await waiterRouts.checkUser(user)
    
        
        if (validate && validate2) {
    
            req.flash('erro', 'Please enter valid details');
            res.redirect('/')
    
    
        } else if (!validate && !validate2) {
    
            res.redirect(`/days/${user_name}`)
    
        }
    }

    async function adduser (req, res) {

        const name = req.body.name;
        const surname = req.body.surname;
        const email = req.body.email;
    
        if (name && surname && email) {
    
            const code = uid();
    
            await waiterRouts.create_user(name, surname, email, code)
            req.flash('info', 'Account created!!   your login code is: ' + code);
        } else {
            req.flash('erro', 'Please enter valid details');
    
        }
    
        res.render('signup')

    }
    async function user(req,res){
        res.render('signup',{

        })
    }

    async function days (req, res) {

        let name = req.params.name
       name = name.toUpperCase();
    
      let days =  await waiterRouts.checkDays(name)
    
        res.render('days', {
            name,
            days
        })

    }
    async function admin (req, res) {

        let data = await waiterRouts.getAdmin();
        
        res.render('admin', {
            data
        })
    }
    async function selectDays (req, res) {

        let checkbox = req.body.selectDays
        let user_name = req.params.name
        
        await waiterRouts.addDays(checkbox, user_name)
    
        req.flash('info', 'Your days have been booked');
    
        res.redirect('back')
    
    }
    async function deleted (req,res){

        await waiterRouts.clearAllData()
        req.flash('erro', 'All booked waters have been cleard');
    
        res.redirect('back')
    
    }

    return{
        home,
        login,
        adduser,
        days,
        selectDays,
        deleted,
        admin,
        user
    }

}
