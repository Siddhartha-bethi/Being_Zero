const express = require("express"); //using express js framework
const app= express(); //app contains all the contents of express
const jsdom = require("jsdom");
const path = require('path');
app.use(express.json())
const cors = require('cors');
const corsOptions ={
    origin:'*', 
    credentials:true,            
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
const contestRouter = require("./Routes/contests");
const userRouter = require("./Routes/users");
const batchRouter = require("./Routes/batches");
const charRouter = require("./Routes/charts");
const userProblem = require("./Routes/userProblem");
const contestDataRouter = require("./Routes/addContestData");
const problemRouter = require("./Routes/problem");
const newContestRouter = require("./Routes/createContest");
app.use(express.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname, "../my-app/build")));

app.use("/contests", contestRouter);
app.use("/users", userRouter);
app.use("/batch", batchRouter);
app.use("/chart", charRouter);
app.use("/userproblem",userProblem);
app.use("/contestData", contestDataRouter);
app.use("/newcontest", newContestRouter);


app.get("/*", async (req, res) => {
    res.sendFile(path.join(__dirname, "../my-app/build/index.html"));
   });

app.get("/",(req,res)=>{
    res.send("Welcome to home page of backend");
})
app.listen(2000,()=>{
    console.log("port is listing to 2000");
})