const express = require("express");
const app = express();
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth_routes");

app.use(express.json());

dotenv.config();

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/auth", authRoutes);

app.listen(4000, () =>{
    console.log("Server is running on port 4000");
});