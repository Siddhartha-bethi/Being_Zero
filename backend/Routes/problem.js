const express = require('express');
const { json } = require("express")
const {AddToCollection, getData} = require("../DBInteraction")
const usersModel  = require("../userModel")
const handleModel = require("../handlesModel");
const contestProblemModel = require("../contestProblemModel");
const contestModel = require("../contestModel");
const problemsModel = require('../ProblemModel');
const router=express.Router();

router.get("/getProblemsFromCode",async (req,res)=>{
    let code= req.query.code;
    let obj = await getData(contestModel, {contestCode: code});
    let contestId = obj[0]["_id"];
    let contestProblemObj = await getData(contestProblemModel, {contestId:contestId});
    let allProblemIdsFromContest=[]
    for (let index = 0; index < contestProblemObj.length; index++) {
        const obj = contestProblemObj[index];
        let prbId = obj['problemId'];
        allProblemIdsFromContest.push(prbId);
    }
    let prbobj = await getData(problemsModel, {
        $or:allProblemIdsFromContest 
    });
    res.status(200).json(prbobj);

})
module.exports= router;