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
const cheerio = require('cheerio');
const axios = require('axios');
const {findAndUpdateData, getData, bulkAddTheData, bulkUpdateTheData} = require("./DBInteraction");
const userbatchModel = require("./models/userBatchModel");

const fetchData=async (url)=>{
    try{
        let resp = await axios.get(url);
        return resp.data;
    }
    catch(error){
        console.log("error occured while fetching data ");
        console.log(error);
    }
}

const givePriority=(verdict)=>{
    if(verdict == "accepted"){
        return 10;
    }
    if(verdict == "partially accepted"){
        return 9;
    }
    return 8;
} 

const convertTimeToDate=(timeString)=>{
    const dateString = timeString;

    // Extracting components from the string
    const [time, period, date] = dateString.split(' ');
    const [hours, minutes] = time.split(':');
    const [day, month, yearShort] = date.split('/');

    // Adjusting hours for PM
    let adjustedHours = parseInt(hours, 10);
    if (period === "PM" && adjustedHours !== 12) {
        adjustedHours += 12;
    }
    const year = '20'+yearShort;
    const convertedDate = new Date(year, month - 1, day, adjustedHours, minutes, 0);
    return convertedDate.getTime();
}

async function getRecentSubmissionTime(link){
    let submissionId = link.split("/")[2];
    let url = "https://www.codechef.com/api/submission-details/"+submissionId;
    let res = await axios.get(url);
    let data = res.data;
    return data.data.other_details.submissionDate;
}

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

async function explore_page_helper(element,max_time,slugStatus,$){
    let time = $?.(element)?.find('td:nth-child(1)')?.text()?.trim();
    const problem = $?.(element)?.find('td:nth-child(2) a')?.text()?.trim();
    const verdict = $?.(element)?.find('td:nth-child(3) span')?.attr('title')?.trim(); 
    const solutionLink = $?.(element)?.find('td:nth-child(5) a')?.attr('href')?.trim(); 
    let submissionTime = 0;
    if(time.includes("ago")){
        try{
            submissionTime  = await getRecentSubmissionTime(solutionLink);
        }
        catch(error){
            console.log("taking default", solutionLink,problem,verdict);
            submissionTime = convertTimeToDate(time);
        }
    }
    else{
        submissionTime = convertTimeToDate(time);
    }
    //console.log(submissionTime, problem, verdict, max_time);
    if(max_time>submissionTime){
        console.log("gone");
        return false;
    }
    if(problem in slugStatus){
        p1 = givePriority(slugStatus[problem])
        p2 = givePriority(verdict)
        if(p2 > p1){
            slugStatus[problem]= verdict
        } 
    }
    return true;
}

async function explore_page(userId , pageNumber, slugStatus, max_time){
    const url = 'https://www.codechef.com/recent/user?page=' + pageNumber + '&user_handle=' + userId;
    const response = await fetchData(url);
    const $ = cheerio.load(response?.content);
    let max_pages = Number(response?.max_page);
    if(pageNumber > max_pages){
        return false;
    }
    let problems = [];
    let results = [];
    let  lastTime = "";
    ArrayofElements = [];
    $?.('.dataTable tbody tr').each((index , element) => {
        ArrayofElements.push(element);
    });
    for(index = 0;index < ArrayofElements.length;index++){
        let res = await explore_page_helper(ArrayofElements[index],max_time,slugStatus,$);
        if(res == false){
            return res;
        }
    }
    return true
}

async function GetAllUserIdOfBatch(batch){
    let batchObj = await batchModel.findOne({'batch':batch});
    let batchId = batchObj["_id"];
    let userBatchObj = await userBatchModel.find({batchid:batchId});
    alluserIds = userBatchObj.map((userbatch)=>{
        return userbatch.studentid;
    })
   //console.log(alluserIds);
    return alluserIds;
}

async function updateSolvedStatusOfUser(userId, contestCode){
    const userproblemStatus = await GetUnsolvedProblemsOfUser(userId, contestCode)
    // year, month, date, hour, min, sec, mill
    let contestObj = await contestsModel.findOne({contestCode:contestCode});
    let time = contestObj.endTime;
    console.log("contest end time is ",time.toLocaleDateString()+" "+time.toLocaleTimeString());
    max_time =time.getTime();
    let codechefId = userproblemStatus["codechefId"];
    let pageNumber = 0
    for(pageNumber = 0;pageNumber<10000;pageNumber++){
        console.log(pageNumber);
        let res= await explore_page(codechefId, pageNumber, userproblemStatus,max_time);
        if(res == false){
            break;
        }
    }
    return userproblemStatus;
}

async function GetUnsolvedProblemsOfUser(userId1, code){
    let details = {
        'userId':userId1,
        'contestCode':code,
    }
    let userId = details.userId;
    let contestCode = details.contestCode;
    let contestObj = await contestsModel.findOne({contestCode:contestCode});
    let contestId = contestObj["_id"];
    let allContestProblemObj = await contestProblemModel.find({contestId:contestId}).populate("problemId");
    let allContestProblemId = allContestProblemObj.map((ele)=>{
          return ele.problemId._id;
    })
    let allstatus = ["accepted","lower_solved,lower_partial","solved"]
    const unsolved = await userProblemModel.find({userId:userId,problemId:{$in:allContestProblemId},status:{$nin:allstatus}}).populate("problemId");
    const resultObj = {}
    unsolved.forEach(element => {
        let slug = element.problemId.slug
        let verdict = element.status 
        resultObj[slug] = verdict
      });
    const handlesObj = await handlesModel.findOne({userid:userId});
    const codechefId = handlesObj["codechefHandle"];
    resultObj["codechefId"] = codechefId;
    return resultObj;
}

async function UpdateUserSlugsProblem(userproblemStatus){
    let codechefId = userproblemStatus["codechefId"];
    delete userproblemStatus.codechefId;
    let handleObj = await handlesModel.findOne({codechefHandle:codechefId});
    let userId = handleObj["userid"];
    res = []
    for (let slug in userproblemStatus) {
        let obj = {};
        let verdict = userproblemStatus[slug]
        let problemObj = await problemsModel.findOne({slug:slug});
        let probId = problemObj["_id"];
        filter = {
            'problemId' : probId,
            'userId' : userId,
        }
        update = {
            'problemId' : probId,
            'userId' : userId,
            'status' : verdict,
        }
        obj['filter'] = filter;
        obj['update'] = update;
        res.push(obj);
    }
    await bulkUpdateTheData(userProblemModel, res);
}

module.exports = {UpdateUserSlugsProblem,GetAllUserIdOfBatch,updateSolvedStatusOfUser,explore_page,updateUserContestData, AddManyUserBatchCollections,findAndUpdateManyCollectionOfUsers,userBatchMapHelper,AddUserContestData}