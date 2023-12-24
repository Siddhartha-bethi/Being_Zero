const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const userModel = require('./userModel');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var handlesSchema = new Schema({
    userid            : {type: Schema.Types.ObjectId, ref : 'users'},
    leetcodeHandle    : {type : String},
    codeforcesHandle  : {type : String},
    codechefHandle    : {type : String},
    mentorpickHandle  :  {type : String},
})
const handleModel=mongoose.model("handles", handlesSchema);
module.exports=handleModel;