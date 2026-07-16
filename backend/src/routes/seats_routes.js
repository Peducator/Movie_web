const router = require("express").Router();
const { getSeatsByShowtime,getBookedSeatsByShowtime } = require("../controllers/seats_controllers");

router.get("/showtimes/booked/:showtimeId", getBookedSeatsByShowtime);
router.get("/showtimes/:showtimeId", getSeatsByShowtime);

module.exports = router;