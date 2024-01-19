const express = require('express');
const { json } = require("express")
const {findAndUpdateData, getData} = require("../DBInteraction");
const {UpdateUserSlugsProblem, updateSolvedStatusOfUser,GetAllUserIdOfBatch} = require("../helperFunction");
const usersModel  = require("../models/userModel")
const handleModel = require("../models/handlesModel");
const router=express.Router()

router.post("/upsolveData",async(req,res)=>{
    let details = req.body;
    let batch = details.batch; 
    let contestCode = details.contestCode;
    alluserIds = await GetAllUserIdOfBatch(batch);
    for(let index = 0; index < alluserIds.length; index++){
        const userId = alluserIds[index];
        const userproblemStatus = await updateSolvedStatusOfUser(userId, contestCode);
        const res = await UpdateUserSlugsProblem(userproblemStatus);
    }
    res.send("done updating");
})
module.exports= router;

