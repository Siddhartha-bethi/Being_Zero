import logo from './logo.svg';
import './App.css';
import axios from "axios";
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import StackedBarChart from "./StackedBarChart";
import AddContest from './AddContest';
import "./styles.css";


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';
  import { Bar } from 'react-chartjs-2';

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
    const globalurl = `http://localhost:2000/`
    async function loadPageData(){
        let url1 = globalurl+`batch/getAllBatches`;
        let batchres = await axios.get(url1);
        let batchobj = batchres.data; 
        let batches = batchobj.map((b)=>{
            return b.batch;
        })
        setAllBatches([...batches]);
        let url2 = globalurl+`contests/getAllStartersCode`;
        let allStartersres = await axios.get(url2);
        let startesobj = allStartersres.data;
        let starters = startesobj.map((s)=>{
            return s.contestCode;
        })
        setAllStarters([...starters]);
    }
      
    async function handleupsolvedProblems(){
        console.log("entered handleContestSheet");
        const input = document.getElementById('upsolvedproblems');
        if (!input.files || input.files.length === 0) {
            alert('Please select an Excel file.');
            return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const binaryData = e.target.result;
                const workbook = XLSX.read(binaryData, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                console.log("My data is data is ", data);
                try{
                    let url = globalurl+"contestData/updateupsolvedProblems";
                    let res = await axios.post(url, data);
                    console.log(res.data);
                    }
                catch(err){
                        console.log("some error while adding contest details to db");
                    }
            } catch (error) {
                console.error('Error parsing Excel file:', error);
                alert('Error parsing Excel file.');
                return null;
            }
        };
        // Read the file as binary data
        reader.readAsBinaryString(file);
    }
    async function handleContestSheet() {
        console.log("entered handleContestSheet");
        const input = document.getElementById('contestuser');
        if (!input.files || input.files.length === 0) {
            alert('Please select an Excel file.');
            return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const binaryData = e.target.result;
                const workbook = XLSX.read(binaryData, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                console.log("My data is ", data);
                try{
                    let url = globalurl+"contestData/postContestDetails";
                    let res = await axios.post(url, data);
                    console.log(res.data);
                    }
                catch(err){
                        console.log("some error while adding contest details to db");
                    }
            } catch (error) {
                console.error('Error parsing Excel file:', error);
                alert('Error parsing Excel file.');
                return null;
            }
        };
        // Read the file as binary data
        reader.readAsBinaryString(file);
    }

    async function handleFile1() {
        console.log("entered")
        const input = document.getElementById('excelFileInput1');

        // Ensure a file was selected
        if (!input.files || input.files.length === 0) {
            alert('Please select an Excel file.');
            return;
        }

        // Get the selected file
        const file = input.files[0];

        // Create a FileReader to read the file
        const reader = new FileReader();

        // Set up the FileReader onload event
        reader.onload = async function (e) {
            try {
                // Get the binary data from the FileReader result
                const binaryData = e.target.result;

                // Parse the Excel file
                const workbook = XLSX.read(binaryData, { type: 'binary' });

                // Assuming you have a sheet named 'Sheet1'
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert the sheet data to JSON
                const data = XLSX.utils.sheet_to_json(sheet);
                console.log("data is ", data);
                let res = await axios.post(globalurl+"users/newusers", data);
                console.log("response got is ", res.data);


            } catch (error) {
                console.error('Error parsing Excel file:', error);
                alert('Error parsing Excel file.');
            }
        };

        // Read the file as binary data
        reader.readAsBinaryString(file);
    }

    async function handleFile2() {
        console.log("entered")
        const input = document.getElementById('excelFileInput2');

        // Ensure a file was selected
        if (!input.files || input.files.length === 0) {
            alert('Please select an Excel file.');
            return;
        }

        // Get the selected file
        const file = input.files[0];

        // Create a FileReader to read the file
        const reader = new FileReader();

        // Set up the FileReader onload event
        reader.onload = async function (e) {
            try {
                // Get the binary data from the FileReader result
                const binaryData = e.target.result;

                // Parse the Excel file
                const workbook = XLSX.read(binaryData, { type: 'binary' });

                // Assuming you have a sheet named 'Sheet1'
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert the sheet data to JSON
                const data = XLSX.utils.sheet_to_json(sheet);
                let rolls = []
                console.log("data is ", data);
                data.forEach(element => {
                    rolls.push(element['rollNumber'])
                });
                let object = {
                    batch: data[0]['batch'],
                    rollNumbers: rolls
                }
                console.log(object);
                let res = await axios.post(globalurl+"batch/postbatches", object);
                console.log("response got is ", res.data);


            } catch (error) {
                console.error('Error parsing Excel file:', error);
                alert('Error parsing Excel file.');
            }
        };

        // Read the file as binary data
        reader.readAsBinaryString(file);
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
            else if(element['status'] == "upsolved"){
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
        console.log("k1 is ",k1);
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
        console.log("person participation",personparticipatedstatus)
        setUserStatus({...personparticipatedstatus})
        let divarray = [["div","count"]]
        for (const [key, value] of Object.entries(divcount)) {
            divarray.push([key, value]);
        }
        setDivData([...divarray]);
        
        let pparray = [["ParticipationStatus ","count"]]
        pparray.push(["Participated",pcount]);
        pparray.push(["Not Participated",batchsize-pcount]);

        console.log("divdata",divarray);
        console.log("participation Data ",pparray)
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
         
        console.log("invalidStudentRolls ",invalidStudentRolls);
        console.log("invalidhandleStudents ",invalidhandleStudentsObj);

        let handlevalidationstatus = [["status","count"]]
        handlevalidationstatus.push(["NOT FILLED",handles["NOT FILLED"]])
        handlevalidationstatus.push(["Invalid",handles["Invalid"]])
        handlevalidationstatus.push(["valid",handles["valid"]])
        setHandleStatus([...handlevalidationstatus])  
        setInvalidHandleStudent([...invalidStudentRolls]);
    }

    async function getData() {
        console.log("came to getData"); 
        let batch = document.getElementById("batch").value
        let code = document.getElementById("code").value
        console.log("batch is ",batch);
        console.log("code is ",code);
        let url = globalurl+`contests/getuserproblemcontestDetails?batch=${batch}&code=${code}`;
        let res = await axios.get(url);
        let userProblemObj = res.data["userProblemObj"];
        let usercontestObj = res.data["usercontestObj"];
        console.log("userProblemObj is ",userProblemObj);
        console.log("usercontestObj ",usercontestObj);
        let data = userProblemObj.map(userproblem => {
            const obj = {
                        name : userproblem.userId.name,
                        rollNumber : userproblem.userId.rollNumber,
                        problemName : userproblem.problemId.name,
                        status : userproblem.status,
                       }
            return obj
        });
        setReportData([...data]);
        await buildProblemSolvedCount(data)
        await buildDivChartData(usercontestObj);
        await buildHandleStatusData(usercontestObj);
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
    return (
        <div className="App1">
            <body>
                {/* <input  type="file" id="excelFileInput" />
    <button onClick={handleFile}>Read Excel</button> */}
                {/* <br>
                </br>
                <br>
                </br> */}
                {/* <input type="file" id="excelFileInput1" />
                <button onClick={handleFile1}>Read Users</button> */}
                <br></br>
                <br></br>
                <input type="file" id="contestuser" />
                <button onClick={handleContestSheet}>Contest Users</button>
                <br></br>
                <input type="file" id="upsolvedproblems" />
                <button onClick={handleupsolvedProblems}>Upload upsolvedproblems</button>
                <br></br>
                <br>
                </br>
                <button onClick={getData}>Click Here to get Participation Data</button>
                <br></br>
                <button onClick={downloadData}>Download Student vs problem Status Data</button>
                <br></br>
                <button onClick={downloadInvalidHandles}>Download Invalid handle Students</button>
                <br></br>
                <br>
                </br>
                <label for="batch">Select A Branch</label>
                <br>
                </br>
                <select name="batch" id="batch" onClick={loadPageData}>
                    {
                        allbatches.map((b)=>{
                            return(
                          <option value = {b}>{b}</option>       
                            )
                        })
                    }
                </select>

                <br></br>
                <label for="code">Select Code</label>
                <br>
                </br>
                <select name="code" id="code">
                {
                        allStarters.map((b)=>{
                            return(
                          <option value = {b}>{b}</option>       
                            )
                        })
                    }
                </select>    

                <br></br>
                <Chart
                    chartType="ColumnChart"
                    data={handleStatus}
                    options={{
                        title: "Handles Status",
                        is3D: true,
                      }}
                    width={"100%"}
                    height={"400px"}
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
                />
            </body>
        </div>
    );
}

export default Home;
