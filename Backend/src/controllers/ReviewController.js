const Review = require("../models/Review");

const submitReview = async (req, res) => {
  try {
    const { farmId, rating, review } = req.body;
    const consumerId = req.user.id;
    const name = req.user.fullName;

    if (!farmId || !rating || !review) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const newReview = new Review({
      farmId,
      consumerId,
      rating,
      review,
    });

    await newReview.save();
    res.status(201).json({
      message: "Review submitted successfully",
      review: { ...newReview._doc, name },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFarmReviews = async (req, res) => {
  try {
    const { farmId } = req.params;
    const reviews = await Review.find({ farmId }).populate(
      "consumerId",
      "fullName"
    );
    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this farm" });
    }
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const editReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const consumerId = req.user.id;

    if (!rating || !review) {
      return res
        .status(400)
        .json({ message: "Rating and review are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (existingReview.consumerId.toString() !== consumerId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own reviews" });
    }

    existingReview.rating = rating;
    existingReview.review = review;
    await existingReview.save();

    // Populate consumerId before sending response
    const populatedReview = await Review.findById(id).populate(
      "consumerId",
      "fullName"
    );
    res.status(200).json({
      message: "Review updated successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Error editing review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const consumerId = req.user.id;

    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (existingReview.consumerId.toString() !== consumerId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { submitReview, getFarmReviews, editReview, deleteReview };
