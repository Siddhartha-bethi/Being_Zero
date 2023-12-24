const express = require('express');
const { json } = require("express")
const {AddToCollection, getData} = require("../DBInteraction")
const contestModel  = require("../contestModel")
const contestProblem = require("../contestProblemModel");
const problemsModel = require("../ProblemModel");
const batchModel = require('../batchModel');
const contestProblemModel = require('../contestProblemModel');
const userProblemModel = require('../userProblemModel');
const handleModel = require('../handlesModel');
const userContestModel = require('../userContestModel');
const { route } = require('./batches');
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
    let response = await AddToCollection(contestModel, object);
    res.send(response)
})

router.get("/getcontestProblems", async(req,res)=>{
    code = req.query.code;
    console.log("came requirment to get slugs of ",code);
    let m1= await getData(contestModel, {contestCode:code});
    let id= m1[0]['_id'];
    let problems = await getData(contestProblem,{contestId:id});
    let problemslugs = []
    for (let index = 0; index < problems.length; index++) {
        const element = problems[index];
        const problemId = element['problemId'];
        const res1 = await getData(problemsModel,{_id:problemId});
        const slug =res1[0]['slug'];
        problemslugs.push(slug);
    }
    res.send(problemslugs);
    
});

router.get("/getuserproblemcontestDetails", async(req,res)=>{
    let batch = req.query.batch;
    let code= req.query.code;
    let studentsIdObj = await batchModel.find({batch:batch}).select({ "studentid": 1, "_id": 0});
    studentsIdObj = studentsIdObj[0];
    let studentIds = studentsIdObj.studentid
    let contestObj = await contestModel.find({contestCode:code})
    let contestId = contestObj[0]["_id"];
    allContestProblemObj = await contestProblemModel.find({contestId:contestId}).populate("problemId");
    //console.log(allContestProblemObj)
    allContestProblemId = allContestProblemObj.map((ele)=>{
        return ele.problemId._id;
    })
    const userProblemObj = await userProblemModel.find({userId:{$in:studentIds},problemId:{$in:allContestProblemId}}).populate(["userId","problemId"]);
    const result = [];
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