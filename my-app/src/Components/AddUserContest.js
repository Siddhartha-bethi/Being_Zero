import React, { useState } from "react";
import axios from "axios";
import { globalUrl } from "../constants";
import { ConvertExcelToData } from "../HelperFunctions/helperFunction";
import loadingGif from './loading.gif'; 
function AddUserContest(){

    const [loading,setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("default");

    function ShowNotification(Message){
        setToastMessage(Message);
        setShowToast(true);
    }

    async function handleContestSheet() {
        try{
            setLoading(true);
            const input = document.getElementById('contestuser');
            const data  = await ConvertExcelToData(input); 
            let url = globalUrl+"contestData/postContestDetails";
            let res = await axios.post(url, data);
            console.log("done with adding ",res);
            ShowNotification("Operation Successfull");
            setLoading(false);
        }
        catch(error){
            console.log("Ended up with Error ",error);
            ShowNotification("Operation Failed");
            setLoading(false);
        }
    }

    async function handleupsolvedProblems(){
        
        try{
            setLoading(true)
            console.log("entered handleContestSheet");
            const input = document.getElementById('upsolvedproblems');
            const data = await ConvertExcelToData(input);
            console.log("My data is data is ", data);     
            let url = globalUrl+"contestData/updateupsolvedProblems";
            let res = await axios.post(url, data);
            console.log("response received");
            console.log(res.data);
            ShowNotification("Operation Successfull");
            setLoading(false)
        }
        catch(err){
            console.log("some error while adding contest details to db");
            setLoading(false)
            ShowNotification("Operation Failed");
        }
    } 

    return(
        <div>
            <div className={`toast position-fixed top-0 start-50 ${showToast ? 'show' : ''}`} role="alert" data-bs-autohide="true" data-bs-delay="5000">
                <div className="toast-header">
                <strong className="me-auto">Message</strong>
                <small className="text-muted">Just Now</small>
                <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={() => setShowToast(false)}></button>
                </div>
                <div className="toast-body">
                {toastMessage}
                </div>
            </div>
            {loading && <img src={loadingGif} alt="Loading..." style={{ width: '250px', height: '250px' }} />}
            <div class = "row">
                <div class="mb-3 mt-4 col-3 ms-4" >
                    <label for="contestuser" class="form-label"><b>Contest Users Excel</b></label>
                    <input class="form-control mb-3" type="file" id="contestuser"/>
                    <button class = "btn btn-danger col-5" onClick={handleContestSheet}>Submit</button>
                </div>
            </div>

            <div class = "row">
                <div class="mb-3 mt-4 col-3 ms-4" >
                    <label for="upsolvedproblems" class="form-label"><b>Upload upsolvedproblems Excel</b></label>
                    <input class="form-control mb-3" type="file" id="upsolvedproblems"/>
                    <button class = "btn btn-success col-5" onClick={handleupsolvedProblems}>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default AddUserContest;