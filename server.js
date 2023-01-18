const express = require('express');
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const passport = require('passport');
const parseArgs = require('minimist');
const args = parseArgs(process.argv.slice(2));
// 
const router = require('./routes/router');
const Container = require('./container.js');
require('./middlewares/auth');
const { optionsMariaDB, optionsSQLite3 } = require('./options/config.js');
const logger = require("./loggers/logger")

const PORT = 8080||args._[0] 
const app = express();
// const PORT =  8050;

const httpserver = new HttpServer(app);
const io = new IOServer(httpserver);

const products = new Container(optionsSQLite3, 'products');
const messages = new Container(optionsMariaDB, 'messages');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			httpOnly: false,
			secure: false,
			maxAge: 100000,
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('views'));
app.engine('handlebars', engine());
app.set('views', './views');
app.set('view engine', 'handlebars');
app.use(router);

io.on('connection', async socket => {
    console.log('Conexión establecida');
    // const data = randomData();
    // io.sockets.emit('products', data);
    socket.on('product', async data => {
        io.sockets.emit('products', data);
    })
});

// const server =  httpserver.listen(PORT,async() => {
//     await mongoose.connect('mongodb+srv://Train:Patagonia2023@cluster0.ilcaprq.mongodb.net/');
//     console.log(`Server running on port ${PORT}`)});

const server = httpserver.listen(PORT, async () => {
	await  mongoose.connect(process.env.MONGO_DB_URL);
	console.log(`Server running on port ${PORT}`);
	logger.info(`Server running on port ${PORT}`);
});
server.on('error', err => console.log(`Error: ${err}`));


