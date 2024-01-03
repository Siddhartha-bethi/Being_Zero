import React, { useState } from 'react';
import axios from "axios";
const AddContest = () => {
  const [contestName, setContestName] = useState('');
  const [contestCode, setContestCode] = useState('');
  const [platform, setPlatform] = useState('');
  const [problems, setProblems] = useState([]);
  const [problemName, setProblemName] = useState('');
  const [problemCode, setProblemCode] = useState('');
  const [problemDivs, setProblemDivs] = useState('');


  const submitContestProblemData = async ()=>{
    let contestObj = {}
    contestObj["contestName"] = contestName;
    contestObj["contestCode"] = contestCode;
    contestObj["platform"] = platform;
    contestObj["problems"] = problems;
    contestObj["startTime"] = new Date();
    contestObj["endTime"] = new Date();
    const globalurl = ``
    console.log(contestObj);
    let url = globalurl+`http://localhost:2000/`;
    let newContestRes = await axios.post(url,contestObj);
    console.log(newContestRes.data);
  }
  const handleAddProblem = () => {
    let trimmedDivs = problemDivs.trim();
    let prbdivs = trimmedDivs.split(",").map(Number);
    // Add a new problem to the problems array
    setProblems((prevProblems) => [
      ...prevProblems,
      { name: problemName, code: problemCode, divs:prbdivs },
    ]);
    // Clear the form fields
    setProblemName('');
    setProblemCode('');
    setProblemDivs([]);
  };
  
  return (
    <div>
      <h2>Contest Details</h2>
      <label>
        Contest Name:
        <input
          type="text"
          value={contestName}
          onChange={(e) => setContestName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Contest Code:
        <input
          type="text"
          value={contestCode}
          onChange={(e) => setContestCode(e.target.value)}
        />
      </label>
      <br />
      <label>
        Platform:
        <input
          type="text"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        />
      </label>
      <br />
      <h2>Problem Details</h2>
      <button onClick={handleAddProblem}>Add Problem</button>
      {problems.map((problem, index) => (
        <div key={index}>
          <label>
            Problem Name:
            <input
              type="text"
              value={problem.name}
              readOnly
            />
          </label>
          <br />
          <label>
            Problem Code:
            <input
              type="text"
              value={problem.code}
              readOnly
            />
          </label>
          <br />
          <label>
            Divs Included:
            <input
              type="text"
              value={problem.divs}
              readOnly
            />
          </label>
          <br></br>
        </div>
      ))}
      {/* New problem input fields */}
      <div>
        <label>
          Problem Name:
          <input
            type="text"
            value={problemName}
            onChange={(e) => setProblemName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Problem Code:
          <input
            type="text"
            value={problemCode}
            onChange={(e) => setProblemCode(e.target.value)}
          />
        </label>
        <br />
        <label>
          Divs Included:
          <input
            type="text"
            value={problemDivs}
            onChange={(e) => setProblemDivs(e.target.value)}
          />
        </label>
        <br></br>
      </div>
      <br></br>
      <br></br>
      <button onClick={submitContestProblemData}>Submit the Contest To add in DB</button>
    </div>
  );
};

export default AddContest;