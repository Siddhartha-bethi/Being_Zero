const express = require('express');
const { json } = require("express")
const {AddToCollection, getData} = require("../DBInteraction")
const usersModel  = require("../userModel")
const handleModel = require("../handlesModel");
const userContestModel = require("../userContestModel");
const contestsModel = require("../contestModel");
const problemsModel = require("../ProblemModel");
const problemDivModel = require("../problemDivModel");
const contestProblemModel = require('../contestProblemModel');
const userProblemModel = require('../userProblemModel');
const batchModel = require('../batchModel');
const router=express.Router()
// const code = 'START110';
// const batch = 'ACE-Y21';

router.post("/postContestDetails",async (req,res)=>{
        data = req.body
        data.forEach(async element => {
            try{
                if(element['Userid']=="NOT FILLED" || element['Userid']=="Invalid"){
                    console.log("invalid userid ",element);
                    let code = element['code']
                    let contestobj = await getData(contestsModel, {contestCode:code});
                    let contestobjId = contestobj[0]["_id"];
                    let rollNumber = element['roll']
                    let name = element['name']
                    let filter = {}
                    if(name!=undefined && name!=null){
                        filter = {
                            name: name
                        }
                    }
                    else if(rollNumber!=undefined &&  rollNumber!=null){
                    filter = {
                        rollNumber: rollNumber
                    }
                    }
                    else{
                    let filter = {rollNumber: -1}
                    }
                    let userobj = await getData(usersModel, filter);
                    if(userobj.length>0){
                        let obj = {
                            userId : userobj[0]["_id"],
                            contestId : contestobjId,
                            div : -1,
                            score : -1,
                            participated : element['Userid'],
                            solved : [],
                            partialSolved : []
                        }
                        console.log("invalid obj is ",obj);
                        let res = await AddToCollection(userContestModel, obj);
                    }
                    else{
                        console.log("user with invalid handle no object found",element);
                    }
                }
                else{
                    let rollNumber = element['roll']
                    let name = element['name']
                    let filter = {}
                    if(name!=undefined && name!=null){
                        filter = {
                            name: name
                        }
                    }
                    else if(rollNumber!=undefined &&  rollNumber!=null){
                    filter = {
                        rollNumber: rollNumber
                    }
                    }
                    else{
                    let filter = {rollNumber: -1}
                    }
                    let userobj = await getData(usersModel, filter);
                    let solved=[]
                    let solved1=[]
                    let partial = []
                    let partial1 = []
                    let userobjId = null;
                    let contestobjId = null;
                    try{
                        userobjId =  userobj[0]["_id"];
                        let code = element['code']
                        let contestobj = await getData(contestsModel, {contestCode:code});
                        contestobjId = contestobj[0]["_id"];
                        if(element['solved'].length>0){
                            solved = element['solved'].split(",");
                        }
                        if(element['solved1'].length>0){
                            solved1 = element['solved1'].split(",");
                        }
                        if(element['partial'].length>0){
                            partial = element['partial'].split(",");
                        }
                        if(element['partial1'].length>0){
                            partial = element['partial1'].split(",");
                        }
                    }
                    catch(err){
                        console.log("error in getting problems of ",name,rollNumber, userobj);
                        console.log("errror is ",err);
                    };
                    let solvedIds = await getProblemIdsFromSlugs(solved);
                    let solved1Ids = await getProblemIdsFromSlugs(solved1);
                    let partialIds = await getProblemIdsFromSlugs(partial);
                    let partial1Ids= await getProblemIdsFromSlugs(partial1);
                    let allsolvedProblemIds = solvedIds.concat(solved1Ids);
                    let allpartialProblemIds = partialIds.concat(partial1Ids);
                    let div = element['div'];
                    let score = element['score'];
                    let participated = element['participated']
                    let num = 0;
                    //getting all the problems Ids from this contest 
                    let allProblemIds = await contestProblemModel.find({contestId:contestobjId}).select({ "problemId": 1, "_id": 0}).populate("problemId");
                    allProblemIds = allProblemIds.filter((ele)=>{
                        if(solved.includes(ele.problemId.slug) || solved1.includes(ele.problemId.slug) || partial.includes(ele.problemId.slug) || partial1.includes(ele.problemId.slug)){
                            return false
                        }
                        return true
                    })
                    let unsolvedProblemIds = allProblemIds.map((ele)=>ele.problemId._id);

                    //adding user-contest details
                    let obj = {
                        userId : userobjId,
                        contestId : contestobjId,
                        div : div,
                        score : score,
                        participated : participated,
                        solved : allsolvedProblemIds,
                        partialSolved : allpartialProblemIds
                    }
                    let res = await AddToCollection(userContestModel, obj);
                   
                    //add in user-problem solved relation
                    for (let index = 0; index < allsolvedProblemIds.length; index++) {
                        const prbId = allsolvedProblemIds[index];
                        let pindex = await getIndexOfProblemFromDiv(div, prbId);
                        let status = 'solved';
                        if(pindex==0){
                            status= 'lower_solved';
                        }
                        let obj = {
                            userId:userobjId,
                            problemId:prbId,
                            status : status
                        }
                        let res = await AddToCollection(userProblemModel, obj);
                        num+=1;
                        //console.log(res);
                    }

                    //add in user-problem partial partial solved relation
                    for (let index = 0; index < allpartialProblemIds.length; index++) {
                        const prbId = allpartialProblemIds[index];
                        let pindex = await getIndexOfProblemFromDiv(div, prbId);
                        let status = 'partial';
                        if(pindex==0){
                            status= 'lower_partial';
                        }
                        let obj = {
                            userId:userobjId,
                            problemId:prbId,
                            status : status
                        }
                        let res = await AddToCollection(userProblemModel, obj);
                        num+=1
                       // console.log(res);
                    }


                    //Adding unsolved user problem relation 
                    for (let index = 0; index < unsolvedProblemIds.length; index++) {
                        const prbId = unsolvedProblemIds[index];
                        const pindex = await getIndexOfProblemFromDiv(div, prbId);
                        let status = 'unsolved';
                        if(pindex==0){
                            status = 'lower_unsolved';
                        }
                        let obj = {
                            userId:userobjId,
                            problemId:prbId,
                            status : status
                        }
                        let res = await AddToCollection(userProblemModel, obj);
                        // console.log(res[0].length);
                        num+=1;
                        //console.log(res);
                    }
                     console.log(num);
                    // console.log("allsoved ",allsolvedProblemIds);
                    // console.log("partial ",allpartialProblemIds);
                    // console.log("unsolved ",unsolvedProblemIds);
                }
            }catch(err){
                console.log("error while adding user details ")
                console.log(element);
                console.log("error is ",err);
            }
        })
        res.send("successfully added");
})

async function getIndexOfProblemFromDiv(d, prbId){
    prbDivObj = await getData(problemDivModel, {problemId: prbId});
    let alldivs = prbDivObj[0]['divs']; 
    for (let index = d; index >= 0; index--) {
        if(alldivs.includes(index)){
            return 1
        }
    }
    return 0;
}

async function getProblemIdsFromSlugs(problems){
    let problemIds = [];
    //console.log("problems is",problems,problems.length);
    for (let index = 0; index < problems.length; index++) {
        const slug = problems[index];
        let prbObj = await getData(problemsModel, {slug:slug});
        if(prbObj[0]){
        let prbId = prbObj[0]["_id"];
        problemIds.push(prbId);
        }
    }
    return problemIds;
}

async function getAllBeingZeroRollNumbers(){
    let res = await usersModel.find().select('rollNumber');
    const rolls = res.map((r)=>{
        return r.rollNumber;
    })
    return rolls;
    //console.log(rolls);
}

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
    data = req.body 
    data.forEach(async element => {
        const code = element['code'];
        if(element['Userid']=="NOT FILLED" || element['Userid']=="Invalid"){
            console.log("invalid user while updating solved count");
            console.log(element);
        }
        else{
            try{
                let rollNumber = element['roll']
                let name = element['name']
                let filter = {}
                if(name!=undefined && name!=null){
                    filter = {
                        name: name
                    }
                }
                else if(rollNumber!=undefined &&  rollNumber!=null){
                filter = {
                    rollNumber: rollNumber
                }
                }
                else{
                let filter = {rollNumber: -1}
                }
                let userobj = await getData(usersModel, filter);
                if(userobj.length>0){
                    const userId = userobj[0]["_id"];
                    let div = element['div']
                    let contestobj = await getData(contestsModel, {contestCode:code});
                    let contestobjId = contestobj[0]["_id"];
                    let upsolvedslugs = []
                    if(element['upsolved'].length>0){
                        upsolvedslugs = element['upsolved'].split(",");
                    }
                    for (let index = 0; index < upsolvedslugs.length; index++) {
                        const prbslug = upsolvedslugs[index];
                        console.log("problem slug is ",prbslug);
                        problemObj = await problemsModel.find({slug:prbslug});
                        //console.log("problemObj is ",problemObj);
                        let prbId = problemObj[0]["_id"];
                        const pindex = await getIndexOfProblemFromDiv(div, prbId);
                        let status = 'upsolved';
                        if(pindex==0){
                            status = 'lower_upsolved';
                        }
                        let obj = {
                            userId:userId,
                            problemId:prbId,
                            status : status
                        }
                        let res1 = await userProblemModel.updateOne({userId:obj.userId,problemId:obj.problemId },{$set:{
                            status: obj.status
                        }})
                        console.log("upsolved",upsolvedslugs);
                    } 
                }
                else{
                    console.log("userobj which did not caught is ",element,userobj);
                }
            }catch(err){
                console.log("error occured while updating for ",element,err);
            }
        }
    });
    console.log("updated ");
    res.send("updated upsolved count")
})

router.post("/getupsolvestatus",(req,res)=>{

})

async function getupsolvestatus(userprbObj){
    let upsolvestatus = {}
    userprbObj.forEach(up=> {
        console.log(up.status, up.problemId.name);
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