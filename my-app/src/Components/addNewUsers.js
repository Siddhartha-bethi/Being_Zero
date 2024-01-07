import React, { useState } from "react";
import axios from "axios";
import { globalUrl } from "../constants";
import { ConvertExcelToData } from "../HelperFunctions/helperFunction";
import loadingGif from './loading.gif';

function AddNewUsers() {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("default");

  function ShowNotification(Message) {
    setToastMessage(Message);
    setShowToast(true);
  }

  async function AddUsersToDB() {
    setLoading(true);
    try {
      const input = document.getElementById('addnewusers');
      let data = await ConvertExcelToData(input);
      console.log("data is ", data);
      let res = await axios.post(globalUrl + "users/newusers", data);
      console.log("response got is ", res.data);
      ShowNotification("Operation Successful");
      setLoading(false);
    } catch (error) {
      ShowNotification("Operation Failed");
      setLoading(false);
      console.log("Ended up with error ", error);
    }
  }

  return (
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
      <div className="mb-3 mt-4 col-2 ms-4" >
        <label htmlFor="addnewusers" className="form-label">Select The Student-Handles File</label>
        <input className="form-control" type="file" id="addnewusers" />
      </div>
      <button type="button" className="btn btn-danger ms-4" onClick={AddUsersToDB}>Upload User-handle Sheet</button>
    </div>
  );
}

export default AddNewUsers;
