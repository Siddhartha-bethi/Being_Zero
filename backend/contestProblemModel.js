const { Timestamp, ObjectId } = require('bson');
const mongoose = require('mongoose');
const contestModel = require("./batchModel");
const problemsModel = require("./ProblemModel"); 

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var contestProblemSchema = new Schema({
    contestId: {type: Schema.Types.ObjectId, ref : 'contests'},
    problemId : {type: Schema.Types.ObjectId, ref : 'problems'},
},{timestamps:true});

const contestProblemModel=mongoose.model("contestProblem", contestProblemSchema);
module.exports=contestProblemModel;