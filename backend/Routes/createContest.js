const { json } = require("express");
const express = require('express');
const {AddOneToCollection, getData} = require("../DBInteraction");
const contestsModel = require("../models/contestModel");
const problemsModel = require("../models/ProblemModel");
const contestProblemModel = require("../models/contestProblemModel");
const problemDivModel = require("../models/problemDivModel");
const router=express.Router();

router.post("/addnewcontest",async (req,res)=>{
    let contestObj = req.body;
    console.log("contestObj is ",contestObj);
    const contestProblems = contestObj["problems"];
    console.log("contestProblems are ");
    console.log(contestProblems);
    let contest = {};
    contest['contestName'] = contestObj.contestName;
    contest['contestCode'] = contestObj.contestCode;
    contest['startTime'] = contestObj.startTime; 
    contest['endTime'] = contestObj.endTime;
    contest['platform'] = contestObj.platform;
    let contestaddRes = await AddOneToCollection(contestsModel,contest);
    console.log("contestAddRes is ");
    console.log(contestaddRes);
    let contestId = contestaddRes["_id"];
    console.log("contestId is ",contestId);
    contestProblems.forEach(async cp => {
        let problemObj = {}
        problemObj["name"] = cp["name"];
        problemObj["slug"] = cp["code"];
        problemObj["platform"] = contestObj.platform;
        let problemRes = await AddOneToCollection(problemsModel, problemObj);
        let problemId = problemRes["_id"];
        let problemDivObj = {}
        problemDivObj["problemId"] = problemId;
        problemDivObj["divs"] = cp.divs;
        let problemDivModelRes = await AddOneToCollection(problemDivModel, problemDivObj);
        console.log(problemDivModelRes);
        let contestProblemObj = {}
        contestProblemObj["contestId"] = contestId;
        contestProblemObj["problemId"] = problemId;
        let contestProblemRes = await AddOneToCollection(contestProblemModel, contestProblemObj);
        console.log(contestProblemRes);
    });
    res.send("successfully added");
})
module.exports= router;