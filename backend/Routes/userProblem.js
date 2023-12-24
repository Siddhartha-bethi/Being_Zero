const express = require('express');
const { json } = require("express")
const {AddToCollection,getData} = require("../DBInteraction")
const usersModel  = require("../userModel")
const userProblemModel = require("../userProblemModel");
const userModel = require("../userModel");
const problemsModel = require("../ProblemModel")
const router=express.Router()

router.post("/solvedProblems",async (req,res)=>{
    console.log("came to add solvedProblems");
    let solved = req.body.solved;
    console.log(solved);
    let roll = req.body.roll;
    console.log("roll is ",roll);
    let res1 = await getData(userModel, {rollNumber:roll});
    let rollId = res1[0]["_id"];
    let obj11 = []
    for (let index = 0; index < solved.length; index++) {
        const slug = solved[index];
        let c = {slug:slug}
        obj11.push(c);
        console.log(obj11)
    }
    let filter = {
        $or: obj11
    }
    console.log(filter)
    let res2 = await getData(problemsModel, filter)
    for (let index = 0; index < res2.length; index++) {
        const problem = res2[index];
        problemId = problem["_id"];
        let myobj = {
            userId:rollId,
            problemId: problemId,
            status:'solved'
        } 
        let result = await AddToCollection(userProblemModel,myobj);
        console.log(result);
    }
    res.send("fine");
});

router.post("/lowerProblems",async (req,res)=>{
        console.log("came to lower Problems");
        let solved = req.body.lower;
        console.log(solved);
        let roll = req.body.roll;
        console.log("roll is ",roll);
        let res1 = await getData(userModel, {rollNumber:roll});
        let rollId = res1[0]["_id"];
        let obj11 = []
        for (let index = 0; index < solved.length; index++) {
            const slug = solved[index];
            let c = {slug:slug}
            obj11.push(c);
            console.log(obj11)
        }
        let filter = {
            $or: obj11
        }
        console.log(filter)
        let res2 = await getData(problemsModel, filter)
        for (let index = 0; index < res2.length; index++) {
            const problem = res2[index];
            problemId = problem["_id"];
            let myobj = {
                userId:rollId,
                problemId: problemId,
                status:'lower'
            } 
            console.log(myobj);
            let result = await AddToCollection(userProblemModel,myobj);
            console.log(result);
        }
        res.send("fine");
});

router.post("/upsolveProblems",async (req,res)=>{
    console.log("came to upsolve Problems");
    let solved = req.body.upsolve;
    console.log(solved);
    let roll = req.body.roll;
    console.log("roll is ",roll);
    let res1 = await getData(userModel, {rollNumber:roll});
    let rollId = res1[0]["_id"];
    let obj11 = []
    for (let index = 0; index < solved.length; index++) {
        const slug = solved[index];
        let c = {slug:slug}
        obj11.push(c);
        console.log(obj11)
    }
    let filter = {
        $or: obj11
    }
    console.log(filter)
    let res2 = await getData(problemsModel, filter)
    for (let index = 0; index < res2.length; index++) {
        const problem = res2[index];
        problemId = problem["_id"];
        let myobj = {
            userId:rollId,
            problemId: problemId,
            status:'upsolve'
        } 
        console.log(myobj);
        let result = await AddToCollection(userProblemModel,myobj);
        console.log(result);
    }
    res.send("fine");
});

module.exports= router;