const router = require('express').Router();
const compression = require('compression');
const passport = require('passport');
const logger= require("../loggers/logger");
const {
	getIndex,
	getLogin,
	getSignup,
	postLogin,
	postSignup,
	getFailLogin,
	getFailSignup,
	getLogout,
	failRoute,
} = require('../controllers/controller');
const checkAuthentication = require('../middlewares/auth');
const { fork } = require('child_process');

// Index
router.get('/', checkAuthentication, getIndex);

// Login
router.get('/login', getLogin);
router.post(
	'/login',
	passport.authenticate('login', { failureRedirect: '/faillogin' }),
	postLogin
);
router.get('/faillogin', getFailLogin);

// Signup
router.get('/signup', getSignup);
router.post(
	'/signup',
	passport.authenticate('signup', { failureRedirect: '/failsignup' }),
	postSignup
);
router.get('/failsignup', getFailSignup);

// Redirect to login & signup
router.post('/redirect-signup', (req, res) => res.redirect('/signup'));
router.post('/redirect-login', (req, res) => res.redirect('/login'));

// Logout
router.post('/logout', getLogout);

// Info
router.get('/api/info', (req, res) => {
	res.json({
		argumentos_de_entrada: process.argv.slice(2),
		nombre_sistema_operativo: process.platform,
		version_node: process.version,
		memoria_total_reservada: process.memoryUsage().rss,
		path_de_ejecucion: process.execPath,
		process_id: process.pid,
		carpeta_del_proyecto: process.cwd(),
	});
});


// Info comprimida
router.get('/api/info2', compression() ,(req, res) => {
	res.json({
		argumentos_de_entrada: process.argv.slice(2),
		nombre_sistema_operativo: process.platform,
		version_node: process.version,
		memoria_total_reservada: process.memoryUsage().rss,
		path_de_ejecucion: process.execPath,
		process_id: process.pid,
		carpeta_del_proyecto: process.cwd(),
	});
});



// Api randoms
router.get('/api/randoms', (req, res) => {
	const forked = fork('./controllers/randoms.js');

	let { cantidad } = req.query;
	let obj = {};
	cantidad
		? forked.send({ cantidad, obj })
		: forked.send({ cantidad: 500000000, obj });
	forked.on('message', msg => res.json(msg));
});

// Fail route
router.get('*', failRoute )

router.get('*',(req,res)=>{
	logger.info(`no existe la pagina `)
}) 



module.exports = router;
