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
const cookieParser = require('cookie-parser')

// const globalLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 20,
//   statusCode: 429,
//   message: { message: "Too many requests, please try again later." },
// });

// const authLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 20,
//   statusCode: 429,
//   message: { message: "Too many requests, please try again later." },
// });

// app.use(globalLimiter);

app.use(express.json());
dotenv.config();

app.use(cookieParser());

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH'],
  credentials: true
}))

app.get("/", (req, res) => {
  res.send("Hello World");
});

// app.use("/auth", authLimiter, authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/home", movieRoutes);
app.use("/api/seats", seatsRoutes);
app.use("/api/showtimes", showtimesRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/transactions", require("./src/routes/transaction_routes"));

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});