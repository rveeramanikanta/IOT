const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const bodyParser = require('body-parser');
const assert = require('assert');
const Promise = require('promise');
const ejs  = require('ejs');
const session = require('express-session');

const io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

var url = 'mongodb://localhost:27017/iotDB';
app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public/')));
app.use(bodyParser.json());

var dbModels = require('./db-models.js');

app.use(session({
	secret : "codetantra",
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 3000000
	}
}));

app.use((req, res, next) => {
	res.locals.invalid = null;
	next();
});

app.get('/', (req, res) => {
	res.render('login');
});

app.get('/secure/home', (req, res) => {
	if(req.session && req.session.user) {
		dbModels.addHomeModel.find({}, (err, homesResults) => {
			dbModels.addFloorModel.find({}, (err, floorsResults) => {
				dbModels.addRoomModel.find({}, (err, roomsResults) => {
					dbModels.addBoardModel.find({}, (err, boardsResults) => {
						dbModels.addSwitchModel.find({}, (err, swchsResults) => {
							if (err) throw err;
							res.render('secure/home', {
								user: req.session.user,
								homesResults: homesResults,
								floorsResults: floorsResults,
								roomsResults: roomsResults,
								boardsResults: boardsResults,
								swchsResults: swchsResults
							});
						});
					});
				});
			});
		});
	} else {
		res.redirect("/");
	}
});


app.get('/invalid', (req, res) => {
	res.render("login", {
	    invalid: "invalid username/password!"
	});
});

app.get('/secure/manage-homes', (req, res) => {
	dbModels.addHomeModel.find({}, (err, homesResults) => {
		if (err) throw err;
		res.render('secure/manage-homes', {
			user: req.session.user,
			homesResults: homesResults
		});
	});
});

app.post('/secure/manage-homes', (req, res) => {
	var actionType = req.body.actionType;
	if (actionType == 'add') {
		dbModels.addHomeModel.create({home: req.body.home, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully added new HOME!", "results" : results});
		});
	} else if (actionType == 'edit') {
		dbModels.addHomeModel.update({_id: req.body._id}, { $set: {home: req.body.home, description: req.body.description, isEnabled: req.body.isEnabled} }, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully updated HOME!", "results" : {_id: req.body._id, home: req.body.home, description: req.body.description, isEnabled: (req.body.isEnabled == 'true')}});
		});
	} else if (actionType == 'delete') {
		dbModels.addHomeModel.remove({_id: req.body._id}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully deleted HOME!", "results" : results});
		});
	}
});

app.get('/secure/manage-floors', (req, res) => {
	dbModels.addHomeModel.find({}, (err, homesResults) => {
		dbModels.addFloorModel.find({}, (err, floorsResults) => {
			if (err) throw err;
			res.render('secure/manage-floors', {
				user: req.session.user,
				homesResults: homesResults,
				floorsResults: floorsResults
			});
		});
	});
});

app.post('/secure/manage-floors', (req, res) => {
	var actionType = req.body.actionType;
	if (actionType == 'add') {
		dbModels.addFloorModel.create({home: req.body.home, floor: req.body.floor, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully added new FLOOR!", "results" : results});
		});
	} else if (actionType == 'edit') {
		dbModels.addFloorModel.update({_id: req.body._id}, { $set: {home: req.body.home, floor: req.body.floor, description: req.body.description, isEnabled: req.body.isEnabled} }, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully updated FLOOR!", "results" : {_id: req.body._id, home: req.body.home, floor: req.body.floor, description: req.body.description, isEnabled: (req.body.isEnabled == 'true')}});
		});
	} else if (actionType == 'delete') {
		dbModels.addFloorModel.remove({_id: req.body._id}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully deleted FLOOR!", "results" : results});
		});
	}
});

app.get('/secure/manage-rooms', (req, res) => {
	dbModels.addHomeModel.find({}, (err, homesResults) => {
		dbModels.addFloorModel.find({}, (err, floorsResults) => {
			dbModels.addRoomModel.find({}, (err, roomsResults) => {
				if (err) throw err;
				res.render('secure/manage-rooms', {
					user: req.session.user,
					homesResults: homesResults,
					floorsResults: floorsResults,
					roomsResults: roomsResults
				});
			});
		});
	});
});

app.post('/secure/manage-rooms', (req, res) => {
	var actionType = req.body.actionType;
	if (actionType == 'add') {
		dbModels.addRoomModel.create({home: req.body.home, floor: req.body.floor, room: req.body.room, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully added new ROOM!", "results" : results});
		});
	} else if (actionType == 'edit') {
		dbModels.addRoomModel.update({_id: req.body._id}, { $set: {home: req.body.home, floor: req.body.floor, room: req.body.room, description: req.body.description, isEnabled: req.body.isEnabled} }, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully updated ROOM!", "results" : {_id: req.body._id, home: req.body.home, floor: req.body.floor, room: req.body.room, description: req.body.description, isEnabled: (req.body.isEnabled == 'true')}});
		});
	} else if (actionType == 'delete') {
		dbModels.addRoomModel.remove({_id: req.body._id}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully deleted ROOM!", "results" : results});
		});
	}
});

app.get('/secure/manage-boards', (req, res) => {
	dbModels.addHomeModel.find({}, (err, homesResults) => {
		dbModels.addFloorModel.find({}, (err, floorsResults) => {
			dbModels.addRoomModel.find({}, (err, roomsResults) => {
				dbModels.addBoardModel.find({}, (err, boardsResults) => {
					if (err) throw err;
					res.render('secure/manage-boards', {
						user: req.session.user,
						homesResults: homesResults,
						floorsResults: floorsResults,
						roomsResults: roomsResults,
						boardsResults: boardsResults
					});
				});
			});
		});
	});
});

app.post('/secure/manage-boards', (req, res) => {
	var actionType = req.body.actionType;
	if (actionType == 'add') {
		dbModels.addBoardModel.create({home: req.body.home, floor: req.body.floor, room: req.body.room, board: req.body.board, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully added new BOARD!", "results" : results});
		});
	} else if (actionType == 'edit') {
		dbModels.addBoardModel.update({_id: req.body._id}, { $set: {home: req.body.home, floor: req.body.floor, room: req.body.room, board: req.body.board, description: req.body.description, isEnabled: req.body.isEnabled} }, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully updated BOARD!", "results" : {_id: req.body._id, home: req.body.home, floor: req.body.floor, room: req.body.room, board: req.body.board, description: req.body.description, isEnabled: (req.body.isEnabled == 'true')}});
		});
	} else if (actionType == 'delete') {
		dbModels.addBoardModel.remove({_id: req.body._id}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully deleted BOARD!", "results" : results});
		});
	}
});

app.get('/secure/manage-switches', (req, res) => {
	dbModels.addHomeModel.find({}, (err, homesResults) => {
		dbModels.addFloorModel.find({}, (err, floorsResults) => {
			dbModels.addRoomModel.find({}, (err, roomsResults) => {
				dbModels.addBoardModel.find({}, (err, boardsResults) => {
					dbModels.addSwitchModel.find({}, (err, swchsResults) => {
						if (err) throw err;
						res.render('secure/manage-switches', {
							user: req.session.user,
							homesResults: homesResults,
							floorsResults: floorsResults,
							roomsResults: roomsResults,
							boardsResults: boardsResults,
							swchsResults: swchsResults
						});
					});
				});
			});
		});
	});
});

app.post('/secure/manage-switches', (req, res) => {
	var actionType = req.body.actionType;
	if (actionType == 'add') {
		dbModels.addSwitchModel.create({home: req.body.home, floor: req.body.floor, room: req.body.room, board: req.body.board, swch: req.body.swch, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully added new Switch!", "results" : results});
		});
	} else if (actionType == 'edit') {
		dbModels.addSwitchModel.update({_id: req.body._id}, { $set: {home: req.body.home, floor: req.body.floor, room: req.body.room, board: req.body.board, swch: req.body.swch, description: req.body.description, isEnabled: req.body.isEnabled} }, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully updated Switch!", "results" : {_id: req.body._id, home: req.body.home, floor: req.body.floor, room: req.body.room, board: req.body.board, swch: req.body.swch, description: req.body.description, isEnabled: (req.body.isEnabled == 'true')}});
		});
	} else if (actionType == 'delete') {
		dbModels.addSwitchModel.remove({_id: req.body._id}, (err, results) => {
			if (err) throw err;
			res.send({"msg" : "successfully deleted Switch!", "results" : results});
		});
	}
});



/*-----------------------------socket.io---------------------------------*/

io.on('connection', function(socket) {
	console.log('user connected');
	
	socket.on("swicthEvent", function(switchInfo) {
		console.log(switchInfo)
	});
	
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

/*-----------------------------socket.io---------------------------------*/



/*-------------------------old-one-------------------------------*/

/*app.post('/manage_homes/add', (req, res) => {
	dbModels.addHomeModel.create({home: req.body.home, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully added new HOME!", "results" : results});
	});
});

app.post('/manage_homes/find', (req, res) => {
	dbModels.addHomeModel.find({}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully find a HOME!", "results" : results});
	});
});

app.post('/manage_floors/add', (req, res) => {
	dbModels.addFloorModel.create({home: req.body.home, floor: req.body.floor, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully added new FLOOR!", "results" : results});
	});
});

app.post('/manage_floors/find', (req, res) => {
	dbModels.addFloorModel.find({}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully find a Floor!", "results" : results});
	});
});*/


/*app.post('/manage_floors/findAllHomes', (req, res) => {
	var jsonDataArr = {};
	findHomes()
		.then((results) => {
			console.log(results);
			for (let i = 0; i < results.length; i++) {
				dbModels.addFloorModel.find({"home": results[i].home}, (err, results) => {
					if (err) throw err;
					jsonDataArr["home1"] = results;
				});
			}
			res.send({"msg" : "Successfully added new HOME!", "results" : jsonDataArr});
			console.log(jsonDataArr);
		}, (err) => {
			console.log("reject block in findHomes/findAllHomes");
		});
});*/


/*app.post('/manage_rooms/add', (req, res) => {
	dbModels.addRoomModel.create({home: req.body.home, floor: req.body.floor, roomType : req.body.room, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully added new Room!", "results" : results});
	});
});

app.post('/manage_rooms/find', (req, res) => {
	dbModels.addRoomModel.find({}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully find a Room!", "results" : results});
	});
});

app.post('/manage_boards/add', (req, res) => {
	dbModels.addBoardModel.create({home: req.body.home, floor: req.body.floor, roomType : req.body.room, board : req.body.board, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully added new board!", "results" : results});
	});
});

app.post('/manage_boards/find', (req, res) => {
	dbModels.addBoardModel.find({}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully find a Board!", "results" : results});
	});
});

app.post('/manage_switches/add', (req, res) => {
	dbModels.addSwitchModel.create({home: req.body.home, floor: req.body.floor, roomType : req.body.room, board : req.body.board, switch : req.body.switch, description: req.body.description, isEnabled: req.body.isEnabled}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully added new Switch!", "results" : results});
	});
});

app.post('/manage_switches/find', (req, res) => {
	dbModels.addSwitchModel.find({}, (err, results) => {
		if (err) throw err;
		res.send({"msg" : "Successfully find a Switch!", "results" : results});
	});
});*/












/*function findHomes() {
	return new Promise((resolve, reject) => {
		dbModels.addHomeModel.find({}, {home : true}, (err, results) => {
			if (err) {
				reject(err);
			}
			resolve(results);
		});
	});
}

function findFloors(homeId) {
	return new Promise((resolve, reject) => {
		dbModels.addFloorModel.find({_id : homeId}, {_id: false, floor : true}, (err, results) => {
			if (err) {
				reject(err);
			}
			resolve(results);
		});
	});
}*/

/*---------------------------------------*/


/*app.get('/', (req, res) => {
	res.render('login');
});

app.get('/invalid', (req, res) => {
	res.render("login", {
	    invalid: "invalid username/password!"
	});
});*/

/*app.get('/secure/home', (req, res) => {
	if(req.session && req.session.user) {
		res.render("secure/home", {
			user: req.session.user
		});
	} else {
		res.redirect("/");
	}
});

app.get('/secure/manage_homes', (req, res) => {
	if(req.session && req.session.user) {
		res.render("secure/manage-homes", {
			user: req.session.user
		});
	} else {
		res.redirect("/");
	}
});

app.get('/secure/manage_floors', (req, res) => {
	if(req.session && req.session.user) {
		findHomes()
			.then((results) => {
				res.render("secure/manage-floors", {
					user: req.session.user,
					homes: results
				});
			}, (err) => {
				console.log("FindHome Reject Block");
			})
	} else {
		res.redirect("/");
	}
});

app.get('/secure/manage_rooms', (req, res) => {
	if(req.session && req.session.user) {
		dbModels.addHomeModel.find({},  { home: true }, function (err, homeDocs) {
			dbModels.addFloorModel.find({}, { home: true, floor: true }, function(err, floorDocs) {
				res.render('secure/manage-rooms', {
					homeOptions: homeDocs,
					floorOptions: floorDocs,
					user: req.session.user
				});
			});
		});
	} else {
		res.redirect("/");
	}
});

app.get('/secure/manage_boards', (req, res) => {
	if(req.session && req.session.user) {
		dbModels.addHomeModel.find({},  { home: true }, function (err, homeDocs) {
			dbModels.addFloorModel.find({}, { home: true, floor: true }, function(err, floorDocs) {
				dbModels.addRoomModel.find({}, { home: true, floor: true, roomType: true }, function(err, roomDocs) {
					res.render('secure/manage-boards', {
						homeOptions: homeDocs,
						floorOptions: floorDocs,
						roomOptions: roomDocs,
						user: req.session.user
					});
				});
			});
		});
	} else {
		res.redirect("/");
	}
});

app.get('/secure/manage_switches', (req, res) => {
	if(req.session && req.session.user) {
		dbModels.addHomeModel.find({},  { home: true }, function (err, homeDocs) {
			dbModels.addFloorModel.find({}, { home: true, floor: true }, function(err, floorDocs) {
				dbModels.addRoomModel.find({}, { home: true, floor: true, roomType: true }, function(err, roomDocs) {
					dbModels.addBoardModel.find({}, { home: true, floor: true, roomType: true, board: true }, function(err, boardDocs) {
						res.render('secure/manage-switches', {
							homeOptions: homeDocs,
							floorOptions: floorDocs,
							roomOptions: roomDocs,
							boardOptions: boardDocs,
							user: req.session.user
						});
					});
				});
			});
		});
	} else {
		res.redirect("/");
	}
});*/

app.post('/login_form', (req, res) => {
	initConnection()
		.then((db) => {
			var myColl = db.collection("usersColl");		
			return findUser(myColl, req.body);
		}, (err) => {
			console.log("reject block");
		}).then((results) => {
			req.session.user = req.body.username;
			res.redirect("/secure/home");
		}, (err) => {
			res.redirect("/invalid");
		});;
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		assert.equal(err, null);
		res.redirect("/");
	});
});

var findUser = function(myColl, query) {
	console.log(query);
	return new Promise((resolve, reject) => {
		myColl.findOne(query, {"username" : true, "password" : true}, (err, results) => {
			if (err) reject(err);
			if (results != null) {
				resolve(results);
			} else {
				reject("invalid user name and password!");
			}
		});
	});
}

var initConnection = function() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(getUrl(), (err, db) => {
			if(err) reject(err);
			resolve(db);
		});
	});
}

var validateUser = function() {
	return new Promise((resolve, reject) => {
		
	});
}

var getCollection = function() {
	return "myCol";
}

var getUrl = function() {
	return url;
}

var isValidMail = function() {
	return true;
}


var insertDocument = function (db, data, callback) {
	db.collection('loginColl').insertOne(data, (err, results) => {
		assert.equal(err, null);
		console.log("Inserted a document.");
		callback();
	});
}

http.listen(app.get('port'), function() {
	console.log("Server in up on PORT : ", app.get("port"));
});
