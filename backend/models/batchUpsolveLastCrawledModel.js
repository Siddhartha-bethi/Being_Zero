const { Timestamp } = require('bson');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var batchUpsolveLastCrawledSchema = new Schema({
    batchId     : {type: Schema.Types.ObjectId, ref : 'batches'},
    contestId  : {type: Schema.Types.ObjectId, ref : 'contests'},
    lastCrawledTime : {type: Date},
},{timestamps:true});

const batchUpsolveLastCrawledModel=mongoose.model("batchUpsolveLastCrawled", batchUpsolveLastCrawledSchema);
module.exports=batchUpsolveLastCrawledModel;