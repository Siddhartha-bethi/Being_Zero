const { Timestamp } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var contestsSchema = new Schema({
    platform      : {type : String, required: true},
    contestName   : {type : String, required: true, unique: true},
    contestCode   : {type : String, required: true, unique: true},
    startTime     : {type: Date},
    endTime       : {type: Date},
},{timestamps:true});

const contestsModel=mongoose.model("contests", contestsSchema);
module.exports=contestsModel;