import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import AddContest from './AddContest';
import AddNewUsers from './addNewUsers';
import AddNewBatchTitle from './AddNewBatchTitle';
import AddUserBatchRelation from './AddUserBatchRelation';
import AddUserContest from './AddUserContest';

function App() {
    return (
        <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home></Home>}></Route>
          <Route path = "/addcontest" element = {<AddContest></AddContest>}></Route>
          <Route path = "/addNewUsers" element = {<AddNewUsers></AddNewUsers>}></Route>
          <Route path = "/addNewBatchTitle" element = {<AddNewBatchTitle></AddNewBatchTitle>}></Route>
          <Route path = "/addUserBatchRelation" element = {<AddUserBatchRelation></AddUserBatchRelation>}></Route>
          <Route path = "/AddUserContest" element = {<AddUserContest></AddUserContest>}></Route>
        </Routes>
        </BrowserRouter>
      );
}

export default App;
