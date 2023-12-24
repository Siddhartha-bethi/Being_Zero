const { Timestamp, ObjectId } = require('bson');
const mongoose = require('mongoose');
const contestModel = require("./contestModel");
const userModel = require("./userModel");

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var userContestSchema = new Schema({
    userId        : {type: Schema.Types.ObjectId, ref : 'users'},
    contestId     : {type: Schema.Types.ObjectId, ref : 'contests'},
    solved        : [{type : Schema.Types.ObjectId, ref : 'problems'}],
    partialSolved : [{type : Schema.Types.ObjectId, ref : 'problems'}],
    div           : {type : String},
    score         : {type : String},
    participated  : {type : String}
},{timestamps:true});

const userContestModel=mongoose.model("userContest", userContestSchema);
module.exports=userContestModel;