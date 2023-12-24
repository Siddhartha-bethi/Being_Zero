const express = require('express');
const { json } = require("express");
const {getData} = require("../DBInteraction")
const batchModel  = require("../batchModel")
const router=express.Router()

router.get("/getPieChat",async (req,res)=>{
    filter={}
    if(req.query.batch){
        filter = {
         ...filter,batch:req.query.batch
        }
     }
    let students = await getStudentsFromBatch(req.query.batch);
    res.send(students)
})

async function getStudentsFromBatch(batch){
    let res = await getData(batchModel,{batch:batch});
    let rollNumbers = res[0].rollNumbers;
    console.log("printing");
    console.log(rollNumbers);
    return rollNumbers;
}

module.exports= router;