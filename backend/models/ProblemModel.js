const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var problemsSchema = new Schema({
    slug            : {type : String, unique: true, required: true},
    platform        : {type : String, required: true},
    name            : {type : String, required: true},
})
const problemsModel=mongoose.model("problems", problemsSchema);
module.exports=problemsModel;