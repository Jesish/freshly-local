const express = require("express");
const router = express.Router();
const {
  submitReview,
  getFarmReviews,
  editReview,
  deleteReview,
} = require("../controllers/ReviewController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, submitReview);
router.get("/farm/:farmId", getFarmReviews);
router.put("/:id", protect, editReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
