require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");

const attemptRoutes = require("./routes/attemptRoutes");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(helmet());
app.use(cors());

app.set("trust proxy", true);

connectDB()
app.get("/",(req,res)=>{
  res.send("server is running")
})
app.use("/api", attemptRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
