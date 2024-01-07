const { ObjectId } = require("bson");
const handlesModel = require("./models/handlesModel");
const userModel = require("./models/userModel");
const batchModel = require("./models/userBatchModel");
const contestsModel = require("./models/contestModel");
const problemDivModel = require("./models/problemDivModel");
const problemsModel = require("./models/ProblemModel");
const contestProblemModel = require("./models/contestProblemModel");
const userProblemModel = require("./models/userProblemModel");
const userContestModel = require("./models/userContestModel");
const { time } = require("console");

async function AddOneToCollection(model,object){
    const res=await model.create(object);
    return res;
}

async function AddManyToCollection(model, arrayOfObj){
    let data = await model.insertMany(arrayOfObj,{ordered : false});
    return data;
}

async function AddManyToCollectionWithUpsert(model, arrayOfObj, filterparameter){
    let promises = [];
    for(index = 0; index < arrayOfObj.length; index++){
        let document = arrayOfObj[index];
        const filter = {[filterparameter] : document[filterparameter]};
        let res = await findAndUpdateData(model,filter, document);
        promises.push(res);
    }
    return promises;
}

async function getData(model,filter){
    const res= await model.find(filter);
    return res;
}

async function deleteData(model, filter){
    const res= await model.deleteOne(filter);
    return res;
}

async function findAndUpdateData(model, filter, update){
    const data = await model.findOneAndUpdate(filter, update, {
        returnDocument: "after",
        upsert: true
    });
    return data; 
}

async function bulkAddTheData(model, arrayOfObj){
    const bulkOperations = arrayOfObj.map(document => ({
        insertOne: {
          document
        }
      }));
    await model.bulkWrite(bulkOperations).then(result => {
          return result;
        })
        .catch(error => {
          console.error(`Error during bulk write: ${error.message}`);
        });
}

async function bulkUpdateTheData(model, arrayOfUpdates){
    const bulkUpdateOperations = arrayOfUpdates.map(element => ({
        updateOne: {
          filter: element.filter,
          update: element.update,
          upsert: true
        },
      }));
      
      // Execute the bulk update
      await model.bulkWrite(bulkUpdateOperations).then(result => {
        console.log("result are ",result);
        return result;
      })
      .catch(error => {
        console.error(`Error during bulk write: ${error.message}`);
      });
}

module.exports = {bulkUpdateTheData,bulkAddTheData,AddManyToCollectionWithUpsert,AddOneToCollection,getData,deleteData,AddManyToCollection,findAndUpdateData}