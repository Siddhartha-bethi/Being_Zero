const express = require('express');
const { json } = require("express")
const {AddOneToCollection, getData,findAndUpdateData} = require("../DBInteraction")
const contestModel  = require("../models/contestModel")
const contestProblemModel = require("../models/contestProblemModel");
const problemsModel = require("../models/ProblemModel");
const { route } = require('./batches');
const userProblemModel = require("../models/userProblemModel");
const userbatchModel = require('../models/userBatchModel');
const userContestModel = require("../models/userContestModel");
const batchModel = require('../models/batchModel');
const usersModel = require('../models/userModel');
const handleModel = require('../models/handlesModel');
const batchUpsolveLastCrawledModel = require("../models/batchUpsolveLastCrawledModel");
const router=express.Router()

router.post("/postcontest",async (req,res)=>{
    console.log("contest details to post");
    let data = req.body ;
    let platform = data['platform']
    let contestCode = data['contestCode']
    let contestName = data['contestName']
    let startTime = date['startTime']
    let endTime = date['endTime']
    let object = {
        platform: platform,
        contestCode: contestCode,
        contestName:contestName,
        startTime: startTime,
        endTime: endTime
    }
    let response = await AddOneToCollection(contestModel, object);
    res.send(response)
})

router.post("/getuserproblemcontestDetails", async(req,res)=>{
    let userIdBatchMapping = {};
    let batches = req.body.batches;
    let code= req.body.code;
    let allbatchstudentsIds = [];
    for(let index = 0; index < batches.length;index++){
        let batch = batches[index];
        let batchObj = await batchModel.find({batch:batch});
        let batchId = batchObj[0]["_id"];
        let studentIdsObjs = await userbatchModel.find({batchid:batchId}).select({ "studentid": 1, "_id": 0});
        studentIdsObjs.forEach(obj => {
            allbatchstudentsIds.push(obj.studentid);
            userIdBatchMapping[obj.studentid] = batch;
        });
    }
    console.log(userIdBatchMapping)
    console.log("students obj length is  ",allbatchstudentsIds.length);
    
    let contestObj = await contestModel.find({contestCode:code})
    let contestId = contestObj[0]["_id"];
    let allContestProblemObj = await contestProblemModel.find({contestId:contestId}).populate("problemId");
    let allContestProblemId = allContestProblemObj.map((ele)=>{
        return ele.problemId._id;
    })
    const userProblemObj = await userProblemModel.find({userId:{$in:allbatchstudentsIds},problemId:{$in:allContestProblemId}}).populate(["userId","problemId"]);
    const usercontestObj = await userContestModel.find({userId:{$in:allbatchstudentsIds},contestId:contestId}).populate(["userId"]);
    let lastUpdatedTimeObj = {}
    for(let index = 0; index<batches.length;index++){
        let batch = batches[index]
        let batchObj = await batchModel.find({batch:batch});
        let batchId = batchObj[0]["_id"];
        let lastUpdatedTime = ""
        try{
            let batchupsolvedObj = await batchUpsolveLastCrawledModel.findOne({batchId:batchId,contestId:contestId});
            let lastCrawledTime = contestObj[0]["endTime"];
            if(batchupsolvedObj==null){
                let filter = {
                    batchId:batchId,
                    contestId:contestId,
                }
                let update = {
                    batchId:batchId,
                    contestId:contestId,
                    lastCrawledTime: lastCrawledTime
                }
                batchupsolvedObj = await findAndUpdateData(batchUpsolveLastCrawledModel, filter,update);
            }
            let time = batchupsolvedObj.lastCrawledTime;
            console.log(batchupsolvedObj, time);
            const timeZone = "Asia/Kolkata";
            const options = { timeZone: timeZone}
            lastUpdatedTime = time.toLocaleDateString('en-US', options)+" "+time.toLocaleTimeString('en-US', options);
        }
        catch(error){
            lastUpdatedTime = "No updates"
            console.log("errir re ",lastUpdatedTime,error);
        }
        lastUpdatedTimeObj[batch] = lastUpdatedTime;
    }
    let userProblemObjWithBatch = userProblemObj.map((userProblem)=>{
        return {
            userId: userProblem.userId,
            problemId: userProblem.problemId,
            status: userProblem.status,
            batch : userIdBatchMapping[userProblem.userId._id]
        }
    })
    console.log("updated userproblem is ",userProblemObjWithBatch[0]);
    res.json({
        userProblemObj:userProblemObjWithBatch,
        usercontestObj:usercontestObj,
        lastUpdatedTimeObj : lastUpdatedTimeObj
    });
})

router.get("/getAllStartersCode",async(req,res)=>{
    let allcodes = await contestModel.find({}).select(({ "contestCode": 1, "_id": 0}));
    console.log("allcodes are", allcodes);
    res.send(allcodes);
})


module.exports= router;