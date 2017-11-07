const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/homeAuto');
var db = mongoose.connection;

var addHomeSchema = mongoose.Schema({
	home : {
		type : String,
		index : true
	},
	description : {
		type : String
	},
	isEnabled : {
		type : Boolean
	}
});

var addFloorSchema = addHomeSchema;
addFloorSchema.add({floor : {
	type : String,
	index : true
}});

var addRoomSchema = addFloorSchema;
addRoomSchema.add({room : {
	type : String,
	index : true
}});

var addBoardSchema = addRoomSchema;
addBoardSchema.add({board : {
	type : String,
	index : true
}});

var addSwitchSchema = addFloorSchema;
addSwitchSchema.add({swch : {
	type : String,
	index : true
}});

var addHomeModel = mongoose.model('addHomeModel', addHomeSchema, 'homes');
var addFloorModel = mongoose.model('addFloorModel', addFloorSchema, 'floors');
var addRoomModel = mongoose.model('addRoomModel', addRoomSchema, 'rooms');
var addBoardModel = mongoose.model('addBoardModel', addBoardSchema, 'boards');
var addSwitchModel = mongoose.model('addSwitchModel', addSwitchSchema, 'switches');

module.exports = {
	'addHomeModel' : addHomeModel,
	'addFloorModel' : addFloorModel,
	'addRoomModel' : addRoomModel,
	'addBoardModel' : addBoardModel,
	'addSwitchModel' : addSwitchModel
}
