const express = require('express');
const { json } = require("express")
// const {AddToCollection, getData} = require("../DBInteraction")
// const userModel  = require("../userModel")
// const handleModel = require("../handlesModel");
// const userContestModel = require("../userContestModel");
// const contestsModel = require("../contestModel");
// const problemsModel = require("../ProblemModel");
// const problemDivModel = require("../problemDivModel");
// const contestProblemModel = require('../contestProblemModel');
// const userProblemModel = require('../userProblemModel');
// const batchModel = require('../batchModel');
const {AddUserContestData, updateUserContestData} = require("../helperFunction");
const router=express.Router()

router.post("/postContestDetails",async (req,res)=>{
        data = req.body;
        let code = data[0]["code"];
        console.time("before")
        let res1 = await AddUserContestData(data,code);
        console.timeEnd("before");
        res.status(200).json(res1);
})

router.get("/getcontestDetails",async (req,res)=>{
    let userids = [];
    console.log("came inside");
    const batchObjs = await getData(batchModel, {batch:batch});
    const rollNumbers = batchObjs[0]["rollNumbers"]
    console.log("collected rollNumbers", rollNumbers);
    for (let index = 0; index < rollNumbers.length; index++) {
        const roll = rollNumbers[index];
        let userObj = await getData(usersModel, {rollNumber: roll});
        let userId = userObj[0]["_id"];
        console.log(index);
        userids.push(userId);
    }
    let contestObj = await getData(contestsModel, {contestCode: code})
    let contestId = contestObj[0]["_id"];
    let contestprb = await contestProblemModel.find({contestId:contestId}).populate('problemId');
    allprbsnames = []
    const allprbsId = contestprb.map((ele)=>{
        return ele.problemId._id;
    })

    let userproblem = await userProblemModel.find({
        userId:{$in:userids},problemId:{$in:allprbsId}
    }).populate('problemId');
    
    let upsolveStatus = await getupsolvestatus(userproblem);
    console.log(upsolveStatus);

    console.log("userids ",userids);
    ans = [] 
    for (let index = 0; index < userids.length; index++) {
        const userId = userids[index];
        try{
        let details = await userContestModel.find({userId: userId, contestId: contestId}).populate('solved');
        ans.push(details[0]);
        }
        catch(err){
            console.log("Did not participate ",userId,code);
        }
        console.log(index);
    }
    console.log("sending response ",ans.length);
    res.status(200).json({
        ans:ans,
        upsolveStatus:upsolveStatus
    });
})

router.post("/updateupsolvedProblems",async(req,res)=>{
    console.log("came to update upsolved problems");
    data = req.body;
    let code = data[0]["code"];
    console.time("toUpdate");
    let res1 = await updateUserContestData(data, code);
    console.timeEnd("toUpdate");
    console.log("update response ",res1);
    res.status(200).json(res1);
})

async function getupsolvestatus(userprbObj){
    let upsolvestatus = {}
    userprbObj.forEach(up=> {
        if(up.status=='upsolved'){
            if(upsolvestatus.hasOwnProperty(up.problemId.name)==false){
                upsolvestatus[up.problemId.name]=0
            }
            upsolvestatus[up.problemId.name]+=1
        }
    });
    return upsolvestatus;
}
module.exports= router;