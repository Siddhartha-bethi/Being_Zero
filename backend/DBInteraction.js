const { ObjectId } = require("bson");
const handlesModel = require("./handlesModel");
const userModel = require("./userModel");
const batchModel = require("./batchModel");
const contestsModel = require("./contestModel");
const problemDivModel = require("./problemDivModel");
const problemsModel = require("./ProblemModel");
const contestProblemModel = require("./contestProblemModel");
const userProblemModel = require("./userProblemModel");
const userContestModel = require("./userContestModel");

async function AddToCollection(model,object){
    const res=await model.insertMany([object]);
    //console.log(res);
    return res;
}
async function getData(model,filter){
    const res= await model.find(filter);
    return res;
}
async function deleteData(model, filter){
    const res= await model.deleteOne(filter);
    return res;
}

module.exports = {AddToCollection,getData,deleteData}