const express = require('express');
const flash = require('express-flash');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const session = require('express-session');
const waiters = require('./waitersDB');
const routes = require('./routs/waters-routs')
const { default: ShortUniqueId } = require('short-unique-id');
const { as } = require('pg-promise');

const pgp = require('pg-promise')();

const local_database_url = 'postgres://siyabonga:siya@localhost:5432/waiters_app';
const connectionString = process.env.DATABASE_URL || local_database_url;


const app = express();
const uid = new ShortUniqueId({ length: 6 });


const config = {
    connectionString
}
if (process.env.NODE_ENV == "production") {
    config.ssl = {
        rejectUnauthorized: false
    }
}

const db = pgp(config);

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.static("public"))


app.use(session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true
}));


app.use(flash());


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,


    })
);


const waitersFF = waiters(db)

app.get('/', function (req, res) {

    res.render("login", {

    })
})

app.post('/login', async function (req, res) {

    let user_name = req.body.name
    let code = req.body.code
    let user = user_name.toUpperCase()


    let validate = await waitersFF.checkcode(code)
    let validate2 = await waitersFF.checkUser(user)

    if (validate && validate2) {

        req.flash('erro', 'Please enter valid details');
        res.redirect('/')


    } else if (!validate && !validate2) {

        res.redirect(`/days/${user_name}`)

    }
});
app.get('/adduser', function (req, res) {
    res.render('signup')
});

app.post('/adduser', async function (req, res) {

    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;

    if (name && surname && email) {

        const code = uid();

        await waitersFF.create_user(name, surname, email, code)
        req.flash('info', 'Account created!!   your login code is: ' + code);
    } else {
        req.flash('erro', 'Please enter valid details');

    }

    res.render('signup')
})

// app.get('/adduser/:name', async function (req, res) {
//     res.render('days', {
//     })

// })

app.get('/days/:name', async function (req, res) {

    let name = req.params.name
   name = name.toUpperCase();
    console.log(name + "----");
  let days =  await waitersFF.checkDays(name)

    res.render('days', {
        name,
        days
    })
})

app.post('/selectDays/:name', async function (req, res) {

    let checkbox = req.body.selectDays
    let user_name = req.params.name
    console.log(checkbox, user_name);
    await waitersFF.addDays(checkbox, user_name)

    req.flash('info', 'your days have been booked');

    res.redirect('back')

})


app.get('/admin', async function (req, res) {

    let data = await waitersFF.getAdmin();
    // console.log(data);
    res.render('admin', {
        data
    })
})












app.post('/addExpence/:name', async function (req, res) {
    const amount = req.body.amount
    const type = req.body.group1
    console.log(type);
    let name = req.params.name
    if (amount && type) {
        let user = name.toUpperCase();
        let catergory = type.toUpperCase()
        await dailyFF.insertExpence(user, catergory, amount)

        req.flash('info', 'Your Daily Expens has been added');
    } else {
        req.flash('info', 'Enter your Expens and type');
    }
    res.redirect(`/expenses/${name}`)
})

app.get('/waiters/:username', function (req, res) {



})




const PORT = process.env.PORT || 3038;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
});