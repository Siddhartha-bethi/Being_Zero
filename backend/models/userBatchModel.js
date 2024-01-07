const { Timestamp } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var userBatchSchema = new Schema({
    batchid     : {type: Schema.Types.ObjectId, ref : 'batches'},
    studentid : {type: Schema.Types.ObjectId, ref : 'users'}
},{timestamps:true});

userBatchSchema.index({ batchid: 1, studentid: 1 }, { unique: true });
const userbatchModel=mongoose.model("userBatch", userBatchSchema);
module.exports=userbatchModel;