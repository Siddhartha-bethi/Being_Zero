const express = require('express');
const { json } = require("express")
const {findAndUpdateData, getData} = require("../DBInteraction");
const {findAndUpdateManyCollectionOfUsers} = require("../helperFunction");
const usersModel  = require("../models/userModel")
const handleModel = require("../models/handlesModel");
const router=express.Router()

router.post("/newusers",async (req,res)=>{
    console.log("adding nnew users");
    data = req.body
    newusers = 0;
    newhandles = 0;
    let allUsers = [];
    try{
        for(let index = 0; index< data.length; index++){
            let element = data[index]
            let object1= {
                rollNumber : element['Roll No'],
                name: element['Name'],
                email: element['Email Id'],
                leetcodeHandle: element['LEETCODE'],
                codeforcesHandle: element['CODEFORCES'],
                codechefHandle: element['CODECHEF'],
                mentorpickHandle: element['MENTORPICK'],
            }
            allUsers.push(object1);
        }
        let filter = "rollNumber"
        console.time("present");
        let allpromises = await findAndUpdateManyCollectionOfUsers(allUsers,filter);
        console.timeEnd("present");
        res.status(200).json({"message":"All ok"});
    }
    catch(error){
        console.log("error while adding students ",error);
        res.status(402).json({"message":"All Not ok"});
    }
})

module.exports= router;