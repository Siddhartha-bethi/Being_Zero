const express = require('express');
const { json } = require("express")
const {AddOneToCollection, getData} = require("../DBInteraction")
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

router.get("/getuserproblemcontestDetails", async(req,res)=>{
    let batch = req.query.batch;
    let code= req.query.code;
    let batchObj = await batchModel.find({batch:batch});
    let batchId = batchObj[0]["_id"]
    let studentIdsObjs = await userbatchModel.find({batchid:batchId}).select({ "studentid": 1, "_id": 0})
    console.log("students objs are ",studentIdsObjs);
    let studentIds = studentIdsObjs.map((obj)=>{
        return obj.studentid;
    })
    let contestObj = await contestModel.find({contestCode:code})
    let contestId = contestObj[0]["_id"];
    let allContestProblemObj = await contestProblemModel.find({contestId:contestId}).populate("problemId");
    let allContestProblemId = allContestProblemObj.map((ele)=>{
        return ele.problemId._id;
    })
    const userProblemObj = await userProblemModel.find({userId:{$in:studentIds},problemId:{$in:allContestProblemId}}).populate(["userId","problemId"]);
    const usercontestObj = await userContestModel.find({userId:{$in:studentIds},contestId:contestId}).populate(["userId"]);
    res.json({
        userProblemObj:userProblemObj,
        usercontestObj:usercontestObj,
    });

})

router.get("/getAllStartersCode",async(req,res)=>{
    let allcodes = await contestModel.find({}).select(({ "contestCode": 1, "_id": 0}));
    console.log("allcodes are", allcodes);
    res.send(allcodes);
})


module.exports= router;