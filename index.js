const express = require('express');
const flash = require('express-flash');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const session = require('express-session');
const waiters = require('./waitersDB');
const routs = require('./routs/waters-routs')
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
const waiterRouts = routs(waitersFF)

app.get('/', waiterRouts.home);

app.post('/login', waiterRouts.login);

app.post('/adduser',waiterRouts.adduser); 

app.get('/days/:name', waiterRouts.days);

app.post('/selectDays/:name',waiterRouts.selectDays);

app.get('/admin',waiterRouts.admin);

app.get('/clear',waiterRouts.deleted);

const PORT = process.env.PORT || 3038;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
});