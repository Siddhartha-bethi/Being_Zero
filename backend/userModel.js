const mongoose = require('mongoose');

const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://190330283:190330283@cluster0.z4ozsgz.mongodb.net/?retryWrites=true&w=majority");

var usersSchema = new Schema({
   rollNumber        : {type : String},
   name              : {type : String},
   email             : {type : String, default:"notuploaded"},
},{timestamps:true})

const usersModel=mongoose.model("users", usersSchema);

module.exports=usersModel;