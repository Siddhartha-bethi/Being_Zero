const { json } = require("express");
const express = require('express');
const {AddToCollection, getData} = require("../DBInteraction");
const contestsModel = require("../contestModel");
const problemsModel = require("../ProblemModel");
const contestProblemModel = require("../contestProblemModel");
const problemDivModel = require("../problemDivModel");
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
    let contestaddRes = await AddToCollection(contestsModel,contest);
    console.log("contestAddRes is ");
    console.log(contestaddRes);
    let contestId = contestaddRes[0]["_id"];
    console.log("contestId is ",contestId);
    contestProblems.forEach(async cp => {
        let problemObj = {}
        problemObj["name"] = cp["name"];
        problemObj["slug"] = cp["code"];
        problemObj["platform"] = contestObj.platform;
        let problemRes = await AddToCollection(problemsModel, problemObj);
        let problemId = problemRes[0]["_id"];
        let problemDivObj = {}
        problemDivObj["problemId"] = problemId;
        problemDivObj["divs"] = cp.divs;
        let problemDivModelRes = await AddToCollection(problemDivModel, problemDivObj);
        console.log(problemDivModelRes);
        let contestProblemObj = {}
        contestProblemObj["contestId"] = contestId;
        contestProblemObj["problemId"] = problemId;
        let contestProblemRes = await AddToCollection(contestProblemModel, contestProblemObj);
        console.log(contestProblemRes);
    });
    res.send("successfully added");
})
module.exports= router;