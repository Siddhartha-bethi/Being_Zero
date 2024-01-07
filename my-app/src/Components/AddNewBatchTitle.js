import React, { useState } from "react";
import axios from "axios";
import { globalUrl } from "../constants";
import loadingGif from './loading.gif'; 
function AddNewBatchTitle(){

    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("default");

    function ShowNotification(Message){
        setToastMessage(Message);
        setShowToast(true);
    }

    async function addNewBatchTitle(){
        try{
            setLoading(true)
            let batchName = document.getElementById("addBatch").value
            document.getElementById("addBatch").value="";
            let url = globalUrl+`batch/addNewBatchTitle`;
            let obj = {
                "batch" : batchName
            }
            let res = await axios.post(url, obj);
            console.log("respond received is ",res.data);
            ShowNotification("Operation Successfull");
            setLoading(false);
        }
        catch(error){
            console.log("Ended Up with error ",error);
            ShowNotification("Operation Failed");
            setLoading(false);
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
            <div class="mb-3 mt-3 col-2">
                <label for="addBatch" class="form-label"><b>New Batch</b></label>
                <input type="text" class="form-control" id="addBatch"/>
                <div class="form-text" style={{color:"red"}}>New Batch Will be created</div>
            </div>
            <button type="button" class="btn btn-primary" onClick={addNewBatchTitle}>Add New Batch</button>
        </div>
    )
}

export default AddNewBatchTitle;