const express = require('express');
const { json } = require("express")
const {AddToCollection} = require("../DBInteraction")
const usersModel  = require("../userModel")
const handleModel = require("../handlesModel");
const router=express.Router()

router.post("/newusers",async (req,res)=>{
    console.log("adding nnew users");
    data = req.body
    data.forEach(async element => {
       object1= {
        rollNumber : element['rollNumber'],
        name: element['Name'],
        email: element['email'],
        }
        let res= await AddToCollection(usersModel,object1);
        console.log("res is ",res[0]);
        let id = res[0]['_id'];
        object2 = {
            leetcodeHandle: element['LEETCODE'],
            codeforcesHandle: element['CODEFORCES'],
            codechefHandle: element['CODECHEF'],
            mentorpickHandle: element['MENTORPICK'],
            userid : id
        }
        let res2 = await AddToCollection(handleModel, object2);
        console.log(res2);
    });
    res.send("successfully Added");
})

router.get("/getrollNumbers", async(req,res)=>{
    console.log("came to get roll numbers");
    if(req.query.batch){
    let students = await getStudentsFromBatch(req.query.batch);
    res.send(students);
    }
})

router.get("/getuserContestDetailsRollNumbers", async(req, res)=>{

})

async function getStudentsFromBatch(batch){
    let res = await getData(batchModel,{batch:batch});
    let rollNumbers = res[0].rollNumbers;
    console.log("printing");
    console.log(rollNumbers);
    return rollNumbers;
}
module.exports= router;