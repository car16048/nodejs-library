var pg = require('pg');

var DbTable = function(tableBase, columnList, bookJoinColumn, bookSearchColumns, parentTypes) {
	var me = this;
	var table = tableBase + 's';
	var pkCol = tableBase + 'id';
	var colList = columnList;
	var parents = {};
	var connStr = process.env.DATABASE_URL;
    var isDebug = false;

	var bookAllSql = 'SELECT b.bookid, b.authorid, b.publisherid, b.title, b.isbn, b.summary, ' +
        "p.companyname publisher, a.firstname || ' ' || a.lastname author " +
        'FROM books b INNER JOIN publishers p ON b.publisherid = p.publisherid INNER JOIN authors a ON b.authorid = a.authorid ';

    var getAllSql = tableBase == 'book' ? bookAllSql : 'SELECT d.' + pkCol + ',d.' + colList.join(',d.') + ' FROM ' + table + ' d';
    var getOneSql = getAllSql + ' WHERE ' + pkCol + ' = $1';
    var deleteSql = 'DELETE FROM ' + table + ' WHERE ' + pkCol + ' = $1';

    if (colList.indexOf('logonname') >= 0) colList.push('passwordhash');
    var getByLogonSql = colList.indexOf('logonname') >= 0 ? 'SELECT ' + pkCol + ',' + colList.join(',') + ' FROM ' + table + ' WHERE logonname = $1' : null;

    var bookSearchSql = '';
    var bookSearchExactSql = '';

	if (bookJoinColumn && bookSearchColumns) {
        bookSearchSql = bookAllSql;
        bookSearchSql += "	INNER JOIN " + table + " t ON b." + bookJoinColumn + " = t." + bookJoinColumn;
        bookSearchSql += " WHERE ";

        bookSearchExactSql = bookSearchSql;

        for (var i = 0; i < bookSearchColumns.length; i++) {
            if (i > 0) { bookSearchSql += ' OR '; bookSearchExactSql += ' OR '; }
            bookSearchSql += 'lower(t.' + bookSearchColumns[i] + ") LIKE '%' || lower($1) || '%'";
            bookSearchExactSql += 't.' + bookSearchColumns[i] + " = $1";
        }
    }

    if (parentTypes) {
        for (var key in parentTypes) {
            parents[key] = getAllSql + ' WHERE ' + parentTypes[key] + ' = $1';
        }
    }

	me.bookSearch = function(searchString, exactSearch, callback) {
		if (!bookSearchSql) return callback('Table does not support book search queries');

		return executeSql(exactSearch ? bookSearchExactSq : bookSearchSql, [ searchString ], callback);
	};

	me.parentSearch = function(parentType, parentId, callback) {
		if (!parents[parentType] || !(parseInt(parentId) > 0)) return callback('Table does not support parent search queries for the given parent type');

		executeSql(parents[parentType], [ parseInt(parentId) ], callback);
	};

	me.get = function(id, callback) {
		if (typeof(id) === 'function' || !(id && parseInt(id) > 0))
		{
			callback = callback || id;
			executeSql(getAllSql, null, callback);
		}
		else
		{
            executeSql(getOneSql, [ parseInt(id) ], callback);
		}
	};

	me.getByLogonName = function(logonName, callback) {
        if (!getByLogonSql) return callback('Table does not support logon name search queries');

        return executeSql(getByLogonSql, [ logonName ], callback);
	};

	me.create = function(args, callback) {
        var createSql = 'INSERT INTO ' + table + ' (';
        var createValuesSql = [];
        var values = [];

        for (var i = 0; i < colList.length; i++) {
        	if (args[colList[i]]) {
                if (values.length > 0) createSql += ', ';
                createSql += colList[i];
                values.push(args[colList[i]]);
                createValuesSql.push('$' + values.length);
			}
        }

        if (values.length == 0) return callback('No values specified to insert');

        createSql += ') VALUES (' + createValuesSql.join(', ') + ') returning ' + pkCol;

		executeSql(createSql, values, function(err, result) {
		    if (err) return callback(err);
		    if (!result || !result.rows) return callback('Could not create the row');
		    me.get(result.rows[0][pkCol], callback);
        });
	};

	me.update = function(id, args, callback) {
		if (!(id && parseInt(id) > 0)) return callback('Invalid ID specified');

        var updateSql = 'UPDATE ' + table + ' SET ';
        var values = [];

        for (var i = 0; i < colList.length; i++) {
            if (args[colList[i]]) {
                if (values.length > 0) updateSql += ', ';
                values.push(args[colList[i]]);
                updateSql += colList[i] + ' = $' + values.length;
            }
        }

        if (values.length == 0) return callback('No values specified to update');

        values.push(parseInt(id));
        updateSql += ' WHERE ' + pkCol + ' = $' + values.length;

        executeSql(updateSql, values, function(err, result) {
            if (err) return callback(err);
            me.get(id, callback);
        });
	};

	me.delete = function(id, callback) {
		if (!(id && parseInt(id) > 0)) return callback('Invalid ID specified');
		
		executeSql(deleteSql, [ parseInt(id) ], callback);
	};

	var executeSql = function (sql, args, callback) {
		if (isDebug) console.log('Connecting to DB - ' + connStr);
		pg.connect(connStr, function (err, client, done) {
			if (err)
			{
				return callback(err);
			}

            if (isDebug) console.log('Executing SQL - ' + sql);
			if (isDebug && args) {
				console.log('    WITH ARGS:');
				for (var i = 0; i < args.length; i++) {
					console.log('        ' + i + ': ' + args[i]);
				}
			}
			
			client.query(sql, args || [], function(err, result) {
				done();
				if (err)
				{
					return callback(err);
				}

				callback(null, result);
			});
		});
	};
};

exports.users = new DbTable('user', ['logonname', 'firstname', 'lastname', 'isadmin']);
exports.publishers = new DbTable('publisher', ['companyname'], 'publisherid', ['companyname']);
exports.authors = new DbTable('author', ['firstname', 'lastname'], 'authorid', ['lastname', 'firstname']);
exports.books = new DbTable('book', ['authorid', 'publisherid', 'title', 'isbn', 'summary'], 'bookid', ['title', 'summary'], {'publisher':'b.publisherid','author':'b.authorid'});
exports.keywords = new DbTable('keyword', ['bookid', 'keyword'], 'bookid', ['keyword'], {'book':'bookid'});
exports.all = {user:exports.users, publisher:exports.publishers, author:exports.authors, book:exports.books, keyword:exports.keywords};