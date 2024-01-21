import './App.css';
import axios from "axios";
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import "./styles.css";
import loadingGif from './loading.gif'; 
import { globalUrl } from '../constants';
import { useNavigate } from "react-router-dom";
import ProgressBar from 'react-bootstrap/ProgressBar';

function Home() {

    const [combine, setCombine] = useState([]);
    const [divData, setDivData] = useState([]);
    const [participationData, setParticipationData] = useState([]);
    const [invalidhandleStudent, setInvalidHandleStudent] = useState([]);
    const [handleStatus, setHandleStatus] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [userStatus, setUserStatus ] = useState({});
    const [allbatches, setAllBatches] = useState([]);
    const [allStarters,setAllStarters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allBatchNames, setAllBatcheNames] = useState([]);
    const [lastUpdate, setLastUpdate] = useState([]);
    const [progress,setProgress] = useState("0%");
    const [showProgressBar,setProgressbar] = useState(false);
    const navigator = useNavigate();
    const [selectedBatches, setSelectedBatches] = useState([]);

    async function updateSelectedBatch(batch){
        const updatedSelection = [...selectedBatches];
        if(updatedSelection.includes(batch)){
            updatedSelection.splice(updatedSelection.indexOf(batch), 1);
        }
        else{
            updatedSelection.push(batch);
        }
        console.log(updatedSelection);
        setSelectedBatches([...updatedSelection]);
    }
    
    async function loadPageData(){
        let url1 = globalUrl+`batch/getAllBatches`;
        let batchres = await axios.get(url1);
        let batchobj = batchres.data; 
        let batches = batchobj.map((b)=>{
            return b.batch;
        })
       setAllBatches([...batches]);
        let url2 = globalUrl+`contests/getAllStartersCode`;
        let allStartersres = await axios.get(url2);
        let startesobj = allStartersres.data;
        let starters = startesobj.map((s)=>{
            return s.contestCode;
        })

        setAllStarters([...starters]);

    }

    const combineData = (data1, data2) => {
        const combined = [];
        const categorySet = new Set();

        // Add categories from both datasets to a Set to ensure uniqueness
        data1.forEach(([category]) => categorySet.add(category));
        data2.forEach(([category]) => categorySet.add(category));

        // Iterate through the unique categories and combine the data
        categorySet.forEach(category => {
            const statusValue = data1.find(([cat]) => cat === category)?.[1] || 0;
            const upsolveValue = data2.find(([cat]) => cat === category)?.[1] || 0;

            combined.push([category, statusValue, upsolveValue]);
        });

        return combined;
    };

    async function buildProblemSolvedCount(data){
        let problemcount = [["Status"], ["solvedCount"]];
        let problemsolvedcount = {}
        let problemupsolvedcount = {}
        data.forEach(element => {
            if(!problemsolvedcount.hasOwnProperty(element['problemName'])){
                problemsolvedcount[element['problemName']] = 0
            }
            if(!problemupsolvedcount.hasOwnProperty(element['problemName'])){
                problemupsolvedcount[element['problemName']] = 0
            }
            if(element['status'] == "solved"){
                problemsolvedcount[element['problemName']]+=1
                problemupsolvedcount[element['problemName']]+=1
            }
            else if(element['status'] == "accepted"){
                problemupsolvedcount[element['problemName']]+=1
            }
        });
        let solvedProblemsinContest = []
        let solvedProblems =[]
        for (const [key, value] of Object.entries(problemsolvedcount)) {
            solvedProblemsinContest.push([key, value]);
            solvedProblems.push([key, problemupsolvedcount[key]])
        }
        let k1 = await combineData(solvedProblemsinContest, solvedProblems);
        const combinedData = [['Category', 'Solved In Contest', 'Total Solved'],...k1];
        setCombine([...combinedData])
    } 
    
    async function buildDivChartData(usercontestObj){
        let personparticipatedstatus = {}
        let divcount = {}
        let pcount = 0
        let batchsize = usercontestObj.length;
        usercontestObj.forEach((ele)=>{
            let roll = ele["userId"]["rollNumber"]
            if(ele["participated"]=="FALSE"){
                personparticipatedstatus[roll]="FALSE"
            }
            else if(ele["participated"]=="TRUE"){
                personparticipatedstatus[roll]="TRUE"
                pcount+=1;
            }
            else{
                personparticipatedstatus[roll]=ele["participated"];
            }
            let div = ele["div"];
            if(divcount.hasOwnProperty(div)){
                divcount[div]+=1
            }
            else{
                divcount[div]=1
            }
        });
        setUserStatus({...personparticipatedstatus})
        let divarray = [["div","count"]]
        for (const [key, value] of Object.entries(divcount)) {
            divarray.push([key, value]);
        }
        setDivData([...divarray]);
        
        let pparray = [["ParticipationStatus ","count"]]
        pparray.push(["Participated",pcount]);
        pparray.push(["Not Participated",batchsize-pcount]);
        setParticipationData([...pparray]);
    }

    async function buildHandleStatusData(usercontestObj){
        let handles = {}
        handles["NOT FILLED"] = 0
        handles["Invalid"] = 0
        handles["valid"]  = 0
        usercontestObj.forEach((ele)=>{
            let roll = ele["userId"]["rollNumber"]
            if(ele["participated"] == "NOT FILLED"){
                handles["NOT FILLED"]+=1
            }
            else if(ele["participated"] == "Invalid"){
                handles["Invalid"]+=1
            } 
            else{
                handles["valid"]+=1
            }
        });

        let invalidhandleStudentsObj = usercontestObj.filter((ele)=>{
            if(ele["participated"] == "NOT FILLED" || ele["participated"] == "Invalid"){
                return true
            } 
        });
        let invalidStudentRolls = invalidhandleStudentsObj.map((ele)=>{
            return [ele["userId"]["rollNumber"], ele["participated"]]
         })

        let handlevalidationstatus = [["status","count"]]
        handlevalidationstatus.push(["NOT FILLED",handles["NOT FILLED"]])
        handlevalidationstatus.push(["Invalid",handles["Invalid"]])
        handlevalidationstatus.push(["valid",handles["valid"]])
        setHandleStatus([...handlevalidationstatus])  
        setInvalidHandleStudent([...invalidStudentRolls]);
    }

    async function getData() {
        setLoading(true)
        console.log("came to getData"); 
        let batches = [...selectedBatches];
        let code = document.getElementById("code").value
        // console.log("batch is ",batch);
        console.log("code is ",code);
        let payload = {
            code: code,
            batches:batches
        }
        let url = globalUrl+`contests/getuserproblemcontestDetails`;
        let res = await axios.post(url, payload);
        let userProblemObj = res.data["userProblemObj"];
        let usercontestObj = res.data["usercontestObj"];
        let lastUpdateTimeObj = res.data["lastUpdatedTimeObj"];
        let ans = []
        for(let key in lastUpdateTimeObj){
            let string = key + " : "+ lastUpdateTimeObj[key]
            ans.push(string);
        }
        setLastUpdate(ans);
        console.log("last update was ",lastUpdateTimeObj);
        console.log("userProblemObj is ",userProblemObj);
        console.log("usercontestObj ",usercontestObj);
        let data = userProblemObj.map(userproblem => {
            const obj = {
                        name : userproblem.userId.name,
                        rollNumber : userproblem.userId.rollNumber,
                        problemName : userproblem.problemId.name,
                        status : userproblem.status,
                        batch : userproblem.batch
                       }
            return obj
        });
        setReportData([...data]);
        await buildProblemSolvedCount(data)
        await buildDivChartData(usercontestObj);
        await buildHandleStatusData(usercontestObj);
        setLoading(false);
    };

    async function downloadData(){
    let data = [...reportData]
    const problemNames = Array.from(new Set(data.map(item => item.problemName)));
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Extract common headers (excluding 'problemName' and 'status')
    const commonHeaders = Object.keys(data[0]).filter(header => header !== 'problemName' && header !== 'status');

    // Combine common headers with unique problem names to create all headers
    const allHeaders = [...commonHeaders, ...problemNames,'Participated'];

    // Create a map to store user data
    const userDataMap = new Map();

    // Populate the map with user data
    data.forEach(item => {
    const userKey = `${item.name}_${item.rollNumber}_${item.handle}`;
    if (!userDataMap.has(userKey)) {
        userDataMap.set(userKey, { ...item, [item.problemName]: item.status });
    } else {
        userDataMap.get(userKey)[item.problemName] = item.status;
    }
    });

    const dataArray = Array.from(userDataMap.values()).map(user => {
        // Add the "Participated" value based on the rollNumber
        const participatedValue = userStatus[user.rollNumber] || '';
        return allHeaders.map(header => (header === 'Participated' ? participatedValue : user[header] || ''));
      });
    console.log("dataarray main is ",dataArray);
    // Add headers to the beginning of the array
    dataArray.unshift(allHeaders);

    // Create a worksheet from the array
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to an Excel file
    XLSX.writeFile(workbook, 'output.xlsx', { bookType: 'xlsx', bookSST: false, type: 'file' });
    }

    async function downloadInvalidHandles(){
        const dataWithHeaders = [['Roll Number', 'Handle'], ...invalidhandleStudent];

        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);
        
        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // Save the workbook to an Excel file
        XLSX.writeFile(wb, 'output.xlsx');
    }

    async function updateUpsolvedStatusOfBatchInContest() {
        
    
        try {
            if(selectedBatches.length>1){
                alert("Please select only one batch for update");
                return 
            }
            let batch = selectedBatches[0];
            let code = document.getElementById("code").value;
            let details = {
                contestCode: code,
                batch: batch
            };
    
            let url = globalUrl + 'upsolve/upsolveData';
            let url1 = globalUrl + 'upsolve/checkupsolveData'
            setProgressbar(true);
            let response1 = await axios.post(url, details);
    
            // Function to make the API call
            const makeApiCall = async () => {
                try {
                    let res = await axios.post(url1, details);
                    console.log("response received is ",res.data.message);

                    if (res.data.message == "Still Processing") {
                        console.log("came with ",res.data);
                        setProgress(res.data.successCount);
                        setTimeout(makeApiCall, 2000);
                        
                    } else {
                        setProgressbar(false);
                        setLoading(true);
                        await getData();
                        setLoading(false);
                    }
                } catch (error) {
                    console.log("error ", error);
                    
                }
            };
    
            // Initial API call
            await makeApiCall();
        } catch (error) {
            console.log("error ", error);
            setLoading(false);
        }
    }
    

    useEffect(()=>{
        loadPageData();
    },[])
    return (
        <div className="App1">
            <body>
                <div class="row mt-4 mb-4">
                    <nav class="navbar navbar-light">
                        <form class="container-fluid justify-content-start">
                            <button class="btn btn-outline-success me-2" type="button" onClick={() => navigator("/addNewUsers")}>AddNewUsers</button>
                            <button class="btn btn-outline-success me-2" type="button" onClick={() => navigator("/addNewBatchTitle")}>AddNewBatchTitle</button>
                            <button class="btn btn-outline-success me-2" type="button" onClick={() => navigator("/addUserBatchRelation")}>AddUserBatchRelation</button>
                            <button class="btn btn-outline-success me-2" type="button" onClick={() => navigator("/AddUserContest")}>AddUserContest</button>
                        </form>
                    </nav>
                </div>
            <div class = "row mt-3">
                <button type="button" class="btn btn-danger col-3 me-4" onClick={downloadData}>Download Data</button>
                <button type="button" class="btn btn-danger col-3 me-4" onClick={downloadInvalidHandles}>Download Invalid Handle</button>
                <button type="button" class="btn btn-danger col-3 me-3" onClick={updateUpsolvedStatusOfBatchInContest}>Update Upsolved Status</button>
                <button type="button" class="btn btn-success col-3 me-3" onClick={getData}>Get Data</button>
                {lastUpdate.map((str)=>{
                    return(
                        <p>
                            {str}
                        </p>
                        
                    )
                })}
            </div>
            {showProgressBar==true &&(
            <ProgressBar now={progress} label={`${progress}%`} />
            )}
                <br></br>
                <div class="row">
                    <div class="row mt-2 mb-2 col-4">
                        <div>
                            {allbatches.map((b) => {
                                return(
                                    <div>
                                        <input
                                            type="checkbox"
                                            id={b}
                                            value={b}
                                            placeholder={b}
                                            checked={selectedBatches.includes(b)}
                                            onChange={() => updateSelectedBatch(b)}
                                        />
                                        <label className="form-check-label" htmlFor={b}>
                                            {b}
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div class="row mt-2 mb-2 col-4">
                        <div>
                            <select class="form-select" name="code" id="code">
                                    {allStarters.map((b)=>{
                                        return(
                                        <option value = {b}>{b}</option>       
                                        )
                                    })
                                }   
                            </select>
                        </div>
                    </div>
                </div>
                
                <br></br>
                {loading ? (
                    <img src={loadingGif} alt="Loading..." style={{ width: '250px', height: '250px' }} />
                ) : (
                    <div className='graphs'>
                    <Chart
                        chartType="ColumnChart"
                        data={handleStatus}
                        options={{
                            title: "Handles Status",
                            is3D: true,
                        }}
                        width={"100%"}
                        height={"400px"}
                        style={{
                            // Add your CSS styles here
                            borderLeft: "1px solid #ccc",
                            borderRight: "1px solid #ccc",
                            borderBottom: "1px solid #ccc",
                            borderRadius: "0 0 8px 8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            margin: "20px 0",
                        }}
                    />
                    <Chart
                        chartType="ColumnChart"
                        data={divData}
                        options={{
                            title: "Div-wise Students Count",
                            is3D: true,
                        }}
                        width={"100%"}
                        height={"400px"}
                        style={{
                            // Add your CSS styles here
                            borderLeft: "1px solid #ccc",
                            borderRight: "1px solid #ccc",
                            borderBottom: "1px solid #ccc",
                            borderRadius: "0 0 8px 8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            margin: "20px 0",
                        }}
                    />

                    <Chart
                        chartType="ColumnChart"
                        data={participationData}
                        options={{
                            title: "Participation Status in Contest",
                            is3D: true,
                        }}
                        width={"100%"}
                        height={"400px"}
                        style={{
                            // Add your CSS styles here
                            borderLeft: "1px solid #ccc",
                            borderRight: "1px solid #ccc",
                            borderBottom: "1px solid #ccc",
                            borderRadius: "0 0 8px 8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            margin: "20px 0",
                        }}
                    />
                    <Chart
                            chartType="ColumnChart"
                            data={combine}
                            options={{
                                title: 'Combined Chart',
                                is3D: true,
                                bar: { groupWidth: '80%' },
                                series: {
                                    0: { color: 'blue' },
                                    1: { color: 'green' },
                                },
                                dataLabels: {
                                    visible: true,
                                    fontSize: 12,
                                    bold: true,
                                    color: 'black',
                                    format: '#',
                                },
                            }}
                            width="100%"
                            height="400px"
                            style={{
                                // Add your CSS styles here
                                borderLeft: "1px solid #ccc",
                                borderRight: "1px solid #ccc",
                                borderBottom: "1px solid #ccc",
                                borderRadius: "0 0 8px 8px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                margin: "20px 0",
                            }}
                        />
                        </div>
                )}
            </body>
        </div>
    );
}

export default Home;
