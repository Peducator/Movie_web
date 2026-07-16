const router = require("express").Router();
const { getOrderByTransaction, completePayment ,cancelTransaction } = require("../controllers/transaction_controllers");
const { verifyToken, adminMiddleware } = require("../middlewares/auth_middlewares");

router.get("/:transactionId", verifyToken, getOrderByTransaction);
router.patch('/:transaction_id/complete', verifyToken, completePayment)
router.patch('/:transaction_id/cancel', verifyToken, cancelTransaction)
module.exports = router;