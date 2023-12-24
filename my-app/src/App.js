import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import AddContest from './AddContest';

function App() {
    return (
        <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home></Home>}></Route>
          <Route path = "/addcontest" element = {<AddContest></AddContest>}></Route>
          
        </Routes>
        </BrowserRouter>
      );
}

export default App;
