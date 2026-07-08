const router = require("express").Router();
const { bookTicket, cancelTicket, getUserTickets } = require("../controllers/tickets_controllers");
const { accessToken } = require("../middlewares/auth_middlewares");

router.post("/", accessToken, bookTicket);
router.delete("/:id", accessToken, cancelTicket);
router.get("/", accessToken, getUserTickets);

module.exports = router;
