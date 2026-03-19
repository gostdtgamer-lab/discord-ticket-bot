const express = require("express")
const fs = require("fs")

const app = express()

app.get("/", (req,res)=>{

 let data = {total:0}

 if (fs.existsSync("tickets.json"))
  data = JSON.parse(fs.readFileSync("tickets.json"))

 res.send(`
 <h1>Discord Ticket Stats</h1>
 <h2>Total Tickets: ${data.total || 0}</h2>
 <p>Live proof system</p>
 `)

})

app.listen(3000, ()=> console.log("Dashboard running"))
