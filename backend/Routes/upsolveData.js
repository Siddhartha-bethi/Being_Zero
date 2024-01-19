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
    alluserIds = await GetAllUserIdOfBatch(batch);
    for(let index = 0; index < alluserIds.length; index++){
        const userId = alluserIds[index];
        const userproblemStatus = await updateSolvedStatusOfUser(userId, contestCode);
        const res = await UpdateUserSlugsProblem(userproblemStatus);
    }
    let filter = {
        batchId: batchId,
        contestId:contestId,
    }
    let update = {
        batchId: batchId,
        contestId:contestId,
        lastCrawledTime : new Date()
    }
    await findAndUpdateData(batchUpsolveLastCrawledModel, filter,update);
    res.send("done updating");
})
module.exports= router;

