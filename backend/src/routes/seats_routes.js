const router = require("express").Router();
const { getSeatsByShowtime } = require("../controllers/seats_controllers");

router.get("/showtime/:showtimeId", getSeatsByShowtime);

module.exports = router;