const express = require('express');
const { json } = require("express")
const {findAndUpdateData, getData} = require("../DBInteraction");
const {UpdateUserSlugsProblem, updateSolvedStatusOfUser,GetAllUserIdOfBatch} = require("../helperFunction");
const usersModel  = require("../models/userModel")
const handleModel = require("../models/handlesModel");
const batchUpsolveLastCrawledModel = require("../models/batchUpsolveLastCrawledModel");
const batchModel = require('../models/batchModel');
const contestsModel = require('../models/contestModel');
const router=express.Router()

router.post("/upsolveData",async(req,res)=>{
    let details = req.body;
    let batch = details.batch;
    let batchObj = await batchModel.findOne({batch:batch});
    let batchId = batchObj["_id"];
    let contestCode = details.contestCode;
    let contestObj = await contestsModel.findOne({contestCode:contestCode});
    let contestId = contestObj["_id"];
    let batchUpsolveLastCrawledModelObj = await batchUpsolveLastCrawledModel.findOne({contestId:contestId,batchId:batchId});
    alluserIds = await GetAllUserIdOfBatch(batch);
    if(batchUpsolveLastCrawledModelObj["status"] == "active"){
        res.json({
            message:"Still Processing",
            successCount: (batchUpsolveLastCrawledModelObj["successCount"]*100)/(alluserIds.length)
        })
    }
    helper(details);
    let filter = {
        batchId: batchId,
        contestId:contestId,
    }
    let update = {
        batchId: batchId,
        contestId:contestId,
        status:"active",
        successCount:0
    }
    await findAndUpdateData(batchUpsolveLastCrawledModel, filter,update);
    res.json({
        message:"Still Processing",
        successCount: (batchUpsolveLastCrawledModelObj["successCount"]*100)/(alluserIds.length)
    });
})

router.post("/checkupsolveData",async(req,res)=>{
    let details = req.body;
    let batch = details.batch;
    let batchObj = await batchModel.findOne({batch:batch});
    let batchId = batchObj["_id"];
    let contestCode = details.contestCode;
    let contestObj = await contestsModel.findOne({contestCode:contestCode});
    let contestId = contestObj["_id"];
    let batchUpsolveLastCrawledModelObj = await batchUpsolveLastCrawledModel.findOne({contestId:contestId,batchId:batchId});
    let  alluserIds = await GetAllUserIdOfBatch(batch);
    console.log("Here final ",batchUpsolveLastCrawledModelObj);
    if(batchUpsolveLastCrawledModelObj["status"]=="active"){
        console.log("Write path");
        res.json({
            message:"Still Processing",
            successCount: (batchUpsolveLastCrawledModelObj["successCount"]*100)/(alluserIds.length)
        })
    }
    else{
        console.log("wrong path ",batchUpsolveLastCrawledModelObj["status"]);
        res.json({
            message:"Done with Update",
            successCount:(batchUpsolveLastCrawledModelObj["successCount"]*100)/(alluserIds.length)
        })
    }

})

async function helper(details){
    let batch = details.batch;
    let batchObj = await batchModel.findOne({batch:batch});
    let batchId = batchObj["_id"];
    let contestCode = details.contestCode;
    let contestObj = await contestsModel.findOne({contestCode:contestCode});
    let contestId = contestObj["_id"];
    alluserIds = await GetAllUserIdOfBatch(batch);
    let done =0; 
    for(let index = 0; index < alluserIds.length; index++){
        const userId = alluserIds[index];
        const userproblemStatus = await updateSolvedStatusOfUser(userId, contestCode);
        const response = await UpdateUserSlugsProblem(userproblemStatus);
        done+=1;
        await findAndUpdateData(batchUpsolveLastCrawledModel, {
            batchId: batchId,
            contestId:contestId,
        },
        {
            batchId: batchId,
            contestId:contestId,
            status:"active",
            successCount:done
        });
        console.log("successdone users ",done);
    };
    let filter = {
        batchId: batchId,
        contestId:contestId,
    }
    let update = {
        batchId: batchId,
        contestId:contestId,
        lastCrawledTime : new Date(),
        status:"inactive",
        successCount:0
    }
    await findAndUpdateData(batchUpsolveLastCrawledModel, filter,update);
};

    
module.exports= router;

