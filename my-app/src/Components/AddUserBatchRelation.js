import React, { useEffect, useState } from "react";
import { ConvertExcelToData } from "../HelperFunctions/helperFunction";
import { globalUrl } from "../constants";
import axios  from "axios";
import loadingGif from './loading.gif'; 
function AddUserBatchRelation(){

    const [allbatches, setAllBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("default");

    function ShowNotification(Message){
        setToastMessage(Message);
        setShowToast(true);
    }

    async function addUsersToBatch(){
        try{
            setLoading(true);
            const input = document.getElementById('userbatchfile');
            const data = await ConvertExcelToData(input);
            const batch = document.getElementById("newbatch").value 
            let obj = {
                "alldata": data, 
                "batch": batch
            }
            let res = await axios.post(globalUrl+"batch/addUserToBatch", obj);
            console.log("response got is ", res.data);
            ShowNotification("Operation Successfull");
            setLoading(false);
        }
        catch(error){
            console.log("Ended with Error ", error);
            ShowNotification("Operation failed");
            setLoading(false);
        }
    }

    async function getAllBatches(){
        let url1 = globalUrl+`batch/getAllBatches`;
        let batchres = await axios.get(url1);
        let batchobj = batchres.data; 
        let batches = batchobj.map((b)=>{
            return b.batch;
        })
       setAllBatches([...batches]);
    }

    useEffect(()=>{
        getAllBatches();
    },[])

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
            <div class="mb-3 mt-4 col-2" >
                <label for="userbatchfile" class="form-label">Select The Students File</label>
                <input class="form-control" type="file" id="userbatchfile"/>
            </div>
            <div class="row mt-2 mb-2">
                <div class = "col-2">
                    <select class="form-select" name="newbatch" id="newbatch">
                        <option selected>Select The Batch</option>
                        {allbatches.map((b)=>{
                                return(
                                <option value = {b}>{b}</option>       
                                )
                            })
                        }
                    </select>
                </div>
            </div>
            <button type="button" class="btn btn-danger" onClick={addUsersToBatch}>Add Users To Above Selected Batch</button>
        </div>
    )
}

export default AddUserBatchRelation;