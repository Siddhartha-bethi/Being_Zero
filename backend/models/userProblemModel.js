const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const usersModel =  require("./userModel");
const problemsModel = require("./ProblemModel");

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var userProblemSchema = new Schema({
   userId                 : {type: Schema.Types.ObjectId, ref : 'users'},
   problemId              : {type: Schema.Types.ObjectId, ref : 'problems'},
   status                 : {type : String, default : 'notSolved'},
},{timestamps:true})
const userProblemModel=mongoose.model("userProblem", userProblemSchema);
module.exports=userProblemModel;