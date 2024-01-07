const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var problemDivSchema = new Schema({
    problemId            : {type : Schema.Types.ObjectId, ref : 'problems'},
    divs                 : {type : [{type : Number}]}
})
const problemDivModel=mongoose.model("problemDiv", problemDivSchema);
module.exports=problemDivModel;