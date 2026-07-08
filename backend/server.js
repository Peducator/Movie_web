const express = require("express");
const app = express();
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth_routes");
const profileRoutes = require("./src/routes/profile_routes");
const movieRoutes = require("./src/routes/movie_routes");
const seatsRoutes = require("./src/routes/seats_routes");
const showtimesRoutes = require("./src/routes/showtimes_routes");
const ticketsRoutes = require("./src/routes/tickets_routes");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  statusCode: 429,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  statusCode: 429,
  message: { message: "Too many requests, please try again later." },
});

app.use(globalLimiter);
app.use("/auth", authLimiter, authRoutes);

app.use(express.json());

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));

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
