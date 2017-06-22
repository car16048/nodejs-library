var express = require('express');
var app = express();
var db = require('./loginDb');
var bodyParser = require('body-parser');
var cache = require('memory-cache');
var uuid = require('uuid/v4');
var bcrypt = require('bcrypt-nodejs');
var cookieParser = require('cookie-parser');

const cacheTimeout = 15 * 60 * 1000;
const invalid = 'Invalid username or password';
const needsUser = 'Authentication Required';
const noAccess = 'Access Denied';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
  res.sendfile('public/index.html', { root: __dirname });
});

app.get('/library/*', function (req, res) {
  res.sendfile('public/index.html', { root: __dirname });
});

app.all('/api/*', function(req, res, next) {
	var sid = req.cookies && req.cookies.SID;
	req.user = sid ? cache.get('SID-' + sid) : null;
	if (req.user) cache.put('SID-' + sid, req.user, cacheTimeout);
    res.header('Cache-Control','no-cache, no-store, must-revalidate');
    res.header('Expires','0');
    res.header('Pragma','no-cache');
	next();
});

app.get('/api/user', function (req, res) {
    res.json(req.user);
});

app.post('/api/user', function (req, res) {
    if (req.body.password) bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if (err) { console.log('POST ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }
        req.body.passwordhash = hash;
        db.users.create(req.body, function (createError, createResult) {
            if (createError) {
                console.log('POST ' + req.url + ' - ERROR: ' + createError); res.json({error: createError});
                return;
            }
            addSession(res, createResult.rows[0]);
        });
    });
});

app.put('/api/user', function (req, res) {
	if (!req.user) { console.log('PUT ' + req.url + ' - ERROR: ' + needsUser); res.json({error: needsUser}); return; }
	if (req.body.password) bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if (err) { console.log('PUT ' + req.url + ' - ERROR: ' + err); res.json({error:err}); return; }
        req.body.passwordhash = hash;
        db.users.update(req.user.userid, req.body, function(err, result) {
            if (err) { console.log('PUT ' + req.url + ' - ERROR: ' + err); res.json({error:err}); return; }
            res.json(result.rows[0]);
        });
	});
});

app.post('/api/session', function (req, res) {
	db.users.getByLogonName(req.body.logonname, function(err, result) {
		if (err) { console.log('POST ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }

		if (!result || !result.rows || result.rows.length <= 0) { res.json({error:invalid}); return; }
		bcrypt.compare(req.body.password, result.rows[0].passwordhash, function(err, match) {
            if (err) { console.log('POST /api/session - ERROR: ' + err); res.json({error: err}); return; }
            if (!match) { res.json({error: invalid}); return; }
            addSession(res, result.rows[0]);
		});
	})
});

app.delete('/api/session', function (req, res) {
    var sid = req.cookie.SID;
    cache.del('SID-' + sid);
});

app.post('/api/search/:type(book|keyword|author|publisher)', function (req, res) {
    if (req.body.id && req.body.by) {
        db.all[req.params.type].parentSearch(req.body.by, req.body.id, function (err, result) { handleSearchResult(res, err, result); });
    } else if (req.body.query) {
        db.all[req.params.type].bookSearch(req.body.query, req.body.exactSearch, function (err, result) { handleSearchResult(res, err, result); });
    } else {
		res.json({rows: []});
	}
});

app.get('/api/:type(book|keyword|author|publisher)/:id([0-9]+)', function (req, res) {
    db.all[req.params.type].get(req.params.id, function(err, result) {
        if (err) { console.log('GET ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }
        res.json(result.rows.length == 0 ? null : result.rows[0]);
    })
});

app.get('/api/:type(book|keyword|author|publisher)', function (req, res) {
    db.all[req.params.type].get(function(err, result) {
        if (err) { console.log('GET ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }
        res.json(result.rows);
    })
});

app.post('/api/:type(book|keyword|author|publisher)', function (req, res) {
    if (!req.user) { console.log('POST ' + req.url + ' - ERROR: ' + needsUser); res.json({error: needsUser}); return; }
    if (req.param.type != 'keyword' && !req.user.isadmin) { console.log('POST ' + req.url + ' - ERROR: ' + noAccess); res.json({error: noAccess}); return; }

    db.all[req.params.type].create(req.body, function(err, result) {
        if (err) { console.log('POST ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }
        res.json(result.rows.length == 0 ? null : result.rows[0]);
    })
});

app.put('/api/:type(book|keyword|author|publisher)/:id([0-9]+)', function (req, res) {
    if (!req.user) { console.log('PUT ' + req.url + ' - ERROR: ' + needsUser); res.json({error: needsUser}); return; }
    if (!req.user.isadmin) { console.log('PUT ' + req.url + ' - ERROR: ' + noAccess); res.json({error: noAccess}); return; }

    db.all[req.params.type].update(req.params.id, req.body, function(err, result) {
        if (err) { console.log('PUT ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }
        res.json(result.rows.length == 0 ? null : result.rows[0]);
    })
});

app.delete('/api/:type(book|keyword|author|publisher)/:id([0-9]+)', function (req, res) {
    if (!req.user) { console.log('DELETE ' + req.url + ' - ERROR: ' + needsUser); res.json({error: needsUser}); return; }
    if (req.param.type != 'keyword' && !req.user.isadmin) { console.log('DELETE ' + req.url + ' - ERROR: ' + noAccess); res.json({error: noAccess}); return; }

    db.all[req.params.type].delete(req.params.id, function(err, result) {
        if (err) { console.log('DELETE ' + req.url + ' - ERROR: ' + err); res.json({error: err}); return; }
        res.json(result.rows);
    })
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function addSession(res, user) {
	var id = uuid();
	cache.put('SID-' + id, user, cacheTimeout);
	res.json({sid: id, user: user});
}

function handleSearchResult(res, err, result) {
	if (err) {
        console.log('handleSearchResult - ERROR: ' + err); res.json({error: err});
	} else {
		res.json({rows: result.rows});
	}
}