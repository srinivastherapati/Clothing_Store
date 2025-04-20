import { useState } from "react";

export default function Review({ mealId, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setFeedback("Please select a rating.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId, rating, comment }),
      });

      if (response.ok) {
        setFeedback("Review submitted successfully!");
        setRating(0);
        setComment("");
        setTimeout(onClose, 1500); // Close the modal after showing feedback
      } else {
        setFeedback("Error submitting review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setFeedback("Error submitting review.");
    }
  }

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Leave a Review</h3>
        <div className="review-rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`review-star ${star <= rating ? "selected" : ""}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <div className="review-modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Submit</button>
        </div>
        {feedback && <p className="review-feedback">{feedback}</p>}
      </div>
    </div>
  );
}
