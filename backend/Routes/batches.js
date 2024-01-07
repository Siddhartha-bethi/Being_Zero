const express = require('express');
const { json } = require("express")
const {getData,findAndUpdateData} = require("../DBInteraction")
const {AddManyUserBatchCollections,userBatchMapHelper} = require("../helperFunction");
const batchModel  = require("../models/batchModel")
const userbatchModel = require("../models/userBatchModel"); 
const usersModel = require('../models/userModel');
const router=express.Router()

router.get("/getAllBatches",async(req,res)=>{
    let batchobj = await batchModel.find({}).select(({ "batch": 1, "_id": 0}));
    res.send(batchobj);
})

router.post("/addNewBatchTitle", async(req,res)=>{
    let obj = req.body
    let res1 = await findAndUpdateData(batchModel,obj,obj);
    res.status(200).json(res1);
})

router.post("/addUserToBatch", async(req,res)=>{
    let data = req.body.alldata 
    let batch = req.body.batch; 
    console.log("came to add students to batch ",batch); 
    try{
        let allqueries = await userBatchMapHelper(data, batch)
        let response = await AddManyUserBatchCollections(allqueries);
        console.log(response);
        res.status(200).json(response);
    }
    catch(error){
        console.log("exisiting with error",error);
        res.status(403).json({
            "error": error
        });
    }
})

module.exports= router;