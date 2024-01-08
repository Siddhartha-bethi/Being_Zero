const { ObjectId } = require("bson");
const handlesModel = require("./models/handlesModel");
const userModel = require("./models/userModel");
const userBatchModel = require("./models/userBatchModel");
const contestsModel = require("./models/contestModel");
const problemDivModel = require("./models/problemDivModel");
const problemsModel = require("./models/ProblemModel");
const contestProblemModel = require("./models/contestProblemModel");
const userProblemModel = require("./models/userProblemModel");
const userContestModel = require("./models/userContestModel");
const batchModel = require("./models/batchModel");

const {findAndUpdateData, getData, bulkAddTheData, bulkUpdateTheData} = require("./DBInteraction");
const userbatchModel = require("./models/userBatchModel");

async function AddManyUserBatchCollections(arrayOfObj){
    const promise = arrayOfObj.map(async(document)=>{
        return findAndUpdateData(userbatchModel, document, document);
    })
    const results = await Promise.all(promise);
    return results;
}

async function findAndUpdateManyCollectionOfUsers(arrayOfObj, filterparameter){
    const promises = arrayOfObj.map(async (document) => {
        const filter = { [filterparameter]: document[filterparameter] };
        const userupdate = {
            rollNumber: document.rollNumber,
            name: document.name,
            email: document.email
        };
        const res1 = await findAndUpdateData(userModel, filter, userupdate);
    
        const handlesupdate = {
            leetcodeHandle: document.leetcodeHandle,
            codeforcesHandle: document.codeforcesHandle,
            codechefHandle: document.codechefHandle,
            mentorpickHandle: document.mentorpickHandle,
            userid: res1["_id"]
        };
        const handlesfilter = {
            userid: res1["_id"]
        };
        return findAndUpdateData(handlesModel, handlesfilter, handlesupdate);
    });
    
    const results = await Promise.all(promises);
    return results;
    
}

async function userBatchMapHelper(data, batch){
    console.log("entered user-batch mapping")
    console.time("time")
    console.log("batch is ",batch);
    let batchobj = await getData(batchModel, {"batch":batch});
    console.log("batch obj is ",batchobj);
    let batch_id = batchobj[0]["_id"];
    console.log("data for user-map is  ",data);
    const promises = data.map(async (document) => {
        const rollNumber = document["Roll No"];
        const filter = { "rollNumber": rollNumber };
        try {
            const userobj = await getData(userModel, filter);
            return {
                "batchid": batch_id, 
                "studentid": userobj[0]["_id"]
            };
        } catch (error) {
            console.error(`Error processing document: ${error.message}`);
            return null; // Return null or some other placeholder for the failed document
        }
    });
    const results = await Promise.all(promises);
    console.timeEnd("time");
    return results;
}

async function AddUserContestData(data, contestcode){
    let problemSlugMap = await getProblemIdSlugsMap(contestcode);
    let problemIdDivsMap = await getProblemIdDivsMap(problemSlugMap);
    let allUserContestObjectArray = []
    let allUserProblemObjectArray = []
    let contestobj = await getData(contestsModel, {contestCode:contestcode});
    let contestobjId = contestobj[0]["_id"];
    console.time("buildingtime");
    for(index = 0; index < data.length; index++){
        let element = data[index];
        await buildUserContestObject(element, allUserContestObjectArray, allUserProblemObjectArray, problemSlugMap, problemIdDivsMap, contestobjId);
    }
   console.timeEnd("buildingtime")
   console.log("done with building ",allUserContestObjectArray.length, allUserProblemObjectArray.length);
   console.time("bulk")
   let res1 =await bulkUpdateTheData(userContestModel,allUserContestObjectArray);
   let res2 = await bulkUpdateTheData(userProblemModel,allUserProblemObjectArray);
   console.log(allUserContestObjectArray[0], allUserProblemObjectArray[0]);
   
   console.timeEnd("bulk");
}

async function updateUserContestData(data, contestcode){
    let problemSlugMap = await getProblemIdSlugsMap(contestcode);
    let problemIdDivsMap = await getProblemIdDivsMap(problemSlugMap);
    allUserProblemUpdateObjectArray = [];
    console.time("update_time");
    for(index = 0; index< data.length; index++){
        await buildUpdateUserContestData(data[index],allUserProblemUpdateObjectArray, problemSlugMap, problemIdDivsMap);
    }
    console.timeEnd("update_time");
    console.time("time_for_bulk_update");
    let response = await bulkUpdateTheData(userProblemModel, allUserProblemUpdateObjectArray);
    console.timeEnd("time_for_bulk_update");
    return response;
}

async function buildUpdateUserContestData(element, allUserProblemUpdateObjectArray, problemSlugMap, problemIdDivsMap){
    if(element['Userid']=="NOT FILLED" || element['Userid']=="Invalid"){
        console.log("invalid user while updating solved count");
        console.log(element);
        return 
    }
    try{
        let rollNumber = element['roll']
        let filter = {
                rollNumber: rollNumber
            }
        let userobj = await userModel.findOne(filter);
        if(userobj){
                const userId = userobj["_id"];
                let div = element['div']
                let upsolvedslugs = []
                if(element['upsolved'].length>0){
                    upsolvedslugs = element['upsolved'].split(",");
                }
                for (let index = 0; index < upsolvedslugs.length; index++) {
                    const prbslug = upsolvedslugs[index];
                    let prbId = problemSlugMap[prbslug];
                    let pindex = await getIndexOfProblemFromDiv(div, problemIdDivsMap[prbId]);
                    let status = 'upsolved';
                    if(pindex==0){
                        status = 'lower_upsolved';
                    }
                    // let res1 = await userProblemModel.updateOne({userId:obj.userId,problemId:obj.problemId },{$set:{
                    //     status: obj.status
                    // }})
                    let filter = {
                        userId:userId,
                        problemId:prbId
                    }
                    let update = {
                        status: status
                    }
                    let obj = {
                        "filter" : filter,
                        "update" : update
                    }
                    allUserProblemUpdateObjectArray.push(obj);
                } 
            }
            else{
                console.log("userobj which did not caught is ",element,userobj);
            }
    }catch(err){
        console.log("error occured while updating for ",element,err);
    }
}

async function buildUserContestObject(element,allUserContestObjectArray, allUserProblemObjectArray, problemSlugMap, problemIdDivsMap, contestobjId){
    if(element['Userid']=="NOT FILLED" || element['Userid']=="Invalid"){
        await buildInvalidUserContestObject(element, allUserContestObjectArray, contestobjId)
    }
    else{
        await buildValidUserContestObject(element, problemSlugMap, problemIdDivsMap, allUserContestObjectArray, allUserProblemObjectArray, contestobjId);
    }

}

async function buildInvalidUserContestObject(element, allUserContestObjectArray, contestobjId){
    let rollNumber = element['roll']
    let filter = {
            rollNumber: rollNumber
    }
    let userobj = await userModel.findOne(filter);
    if(userobj){
            let filter = {
                userId: userobj["_id"],
                contestId: contestobjId,
            }
            update = {
                userId : userobj["_id"],
                contestId : contestobjId,
                div : -1,
                score : -1,
                participated : element['Userid'],
                solved : [],
                partialSolved : []
            }
            let obj = {
                filter : filter,
                update : update,
            }
            allUserContestObjectArray.push(obj);
            console.log(allUserContestObjectArray);
    };
}

async function buildValidUserContestObject(element,problemSlugMap,problemIdDivsMap, allUserContestObjectArray, allUserProblemObjectArray, contestobjId){
    let allcontestproblemIds = Object.values(problemSlugMap)
    let rollNumber = element['roll']
    let name = element['name']
    let filter = {rollNumber: rollNumber}
    let userobj = await userModel.findOne(filter);
    let solved=[]
    let solved1=[]
    let partial = []
    let partial1 = []
    let userobjId =  userobj["_id"];
    let code = element['code']
    try{
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
            partial1 = element['partial1'].split(",");
        }
    }
    catch(err){
        console.log("error in getting problems of ",name,rollNumber, userobj);
        console.log("errror is ",err);
        return {}
    };
    let allsolvedProblemIds = []
    let solvedIds = solved.map(slug=>{
        allsolvedProblemIds.push(problemSlugMap[slug]);
        return problemSlugMap[slug];
    })
    let solved1Ids = solved1.map(slug=>{
        allsolvedProblemIds.push(problemSlugMap[slug]);
        return problemSlugMap[slug]
    })

    let allpartialProblemIds = []
    let partialIds = partial.map(slug=>{
        allpartialProblemIds.push(problemSlugMap[slug]);
        return problemSlugMap[slug]
    })
    let partial1Ids = partial1.map(slug=>{
        allpartialProblemIds.push(problemSlugMap[slug]);
        return problemSlugMap[slug]
    })

    let div = element['div'];
    let score = element['score'];
    let participated = element['participated']
    let unsolvedProblemIds = allcontestproblemIds.filter(problemid=>{
        if(allsolvedProblemIds.includes(problemid) || allpartialProblemIds.includes(problemid)){
            return false;
        }
        return true;
    })

    //Adding user-contest details
    let update = {
        userId : userobjId,
        contestId : contestobjId,
        div : div,
        score : score,
        participated : participated,
        solved : allsolvedProblemIds,
        partialSolved : allpartialProblemIds
    }
    let filter1 = {
        userId: userobj["_id"],
        contestId: contestobjId,
    }
    let obj = {
        filter : filter1,
        update : update,
    }
    allUserContestObjectArray.push(obj);

    //Adding in user-problem solved relation
    for (let index = 0; index < allsolvedProblemIds.length; index++) {
        const prbId = allsolvedProblemIds[index];
        let pindex = await getIndexOfProblemFromDiv(div, problemIdDivsMap[prbId]);
        let status = 'solved';
        if(pindex==0){
            status= 'lower_solved';
        }
        let update = {
            userId:userobjId,
            problemId:prbId,
            status : status
        }
        let filter = {
            userId:userobjId,
            problemId:prbId,
        }
        let obj = {
            filter : filter,
            update:update
        }
        allUserProblemObjectArray.push(obj);
    }

    //Adding in user-problem partial solved relation
    for (let index = 0; index < allpartialProblemIds.length; index++) {
        const prbId = allpartialProblemIds[index];
        let pindex = await getIndexOfProblemFromDiv(div, problemIdDivsMap[prbId]);
        let status = 'partial';
        if(pindex==0){
            status= 'lower_partial';
        }
        let update = {
            userId:userobjId,
            problemId:prbId,
            status : status
        }
        let filter = {
            userId:userobjId,
            problemId:prbId,
        }
        let obj = {
            filter : filter,
            update:update
        }
        allUserProblemObjectArray.push(obj);;
    }

    //Adding unsolved user problem relation 
    for (let index = 0; index < unsolvedProblemIds.length; index++) {
        const prbId = unsolvedProblemIds[index];
        let pindex = await getIndexOfProblemFromDiv(div, problemIdDivsMap[prbId]);
        let status = 'unsolved';
        if(pindex==0){
            status = 'lower_unsolved';
        }
        let update = {
            userId:userobjId,
            problemId:prbId,
            status : status
        }
        let filter = {
            userId:userobjId,
            problemId:prbId,
        }
        let obj = {
            filter : filter,
            update:update
        }
        allUserProblemObjectArray.push(obj);
    }
}

async function getIndexOfProblemFromDiv(d, alldivs){ 
    for (let index = d; index >= 1; index--) {
        if(alldivs.includes(index)){
            return 1
        }
    }
    return 0;
}

async function getProblemIdSlugsMap(contestcode){
    let contestobj = await getData(contestsModel, {contestCode:contestcode});
    let contestobjId = contestobj[0]["_id"];
    let allProblemObj = await contestProblemModel.find({contestId:contestobjId}).select({ "problemId": 1, "_id": 0}).populate("problemId");
    let problemSlugMap = {}
    for(index =0 ; index< allProblemObj.length; index++){
        element = allProblemObj[index];
        problemSlugMap[element['problemId']["slug"]] = element["problemId"]["_id"];
    }
    console.log(problemSlugMap);
    return problemSlugMap
}

async function getProblemIdDivsMap(problemSlugMap){
    let ProblemIdDivsMap = {}
    for(let slug in problemSlugMap){
        let problemid =  problemSlugMap[slug];
        let problemDivs = await problemDivModel.findOne({"problemId":problemid}).select({ "divs": 1, "_id": 0});
        ProblemIdDivsMap[problemid] = problemDivs["divs"]
    }
    console.log(ProblemIdDivsMap);
    return ProblemIdDivsMap
}

async function UpdateBulkForUpsolved(arrayOfObj){

}
module.exports = {updateUserContestData, AddManyUserBatchCollections,findAndUpdateManyCollectionOfUsers,userBatchMapHelper,AddUserContestData}