const express = require('express');
const cors = require("cors");
const { connection } = require('./connection/db');
const loanRoutes = require('./routers/Loan')

const app = express();
app.use(express.json())
app.use(cors())

app.use('/api/loans', loanRoutes)

app.listen(7007,async()=>{
    try{
        await connection
        console.log("Server Connected to the Mongoose");
    }catch(err){
        console.log(err);
    }
    console.log("Server is Running at 7007");
})