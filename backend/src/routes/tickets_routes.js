const router = require("express").Router();
const { bookTicket, cancelTicket, getUserTickets } = require("../controllers/tickets_controllers");
const { verifyToken } = require("../middlewares/auth_middlewares");

router.post("/", verifyToken, bookTicket);
router.get("/my-tickets", verifyToken, getUserTickets);
router.patch("/:transaction_id/cancel", verifyToken, cancelTicket);

module.exports = router;