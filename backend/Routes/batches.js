const express = require('express');
const { json } = require("express")
const {AddToCollection,getData} = require("../DBInteraction")
const batchModel  = require("../batchModel")
const router=express.Router()

router.post("/postbatches",async (req,res)=>{
    console.log("batch details to post");
    data = req.body
    AddToCollection(batchModel, data);
})

router.get("/getAllBatches",async(req,res)=>{
    console.log("came to get all the batches");
    let batchobj = await batchModel.find({}).select(({ "batch": 1, "_id": 0}));
    console.log(batchobj);
    res.send(batchobj);
})

module.exports= router;