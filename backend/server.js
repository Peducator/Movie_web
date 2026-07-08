const express = require("express");
const app = express();
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth_routes");
const profileRoutes = require("./src/routes/profile_routes");
const movieRoutes = require("./src/routes/movie_routes");
const seatsRoutes = require("./src/routes/seats_routes");
const showtimesRoutes = require("./src/routes/showtimes_routes");
const ticketsRoutes = require("./src/routes/tickets_routes");

app.use(express.json());

dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/movie", movieRoutes);
app.use("/seats", seatsRoutes);
app.use("/showtimes", showtimesRoutes);
app.use("/tickets", ticketsRoutes);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
