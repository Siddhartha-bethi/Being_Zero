const { Timestamp } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var batchSchema = new Schema({
    batch     : {type : String, unique: true, required: true},
},{timestamps:true});

const batchModel=mongoose.model("batch", batchSchema);
module.exports=batchModel;