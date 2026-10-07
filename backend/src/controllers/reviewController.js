import { reviewRepository, requestRepository } from '../models/dbRepository.js';

export async function createReview(req, res, next) {
  try {
    const { request_id, rating, review } = req.body;

    if (!request_id || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Request ID, rating (1-5), and review text are required.'
      });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    const request = await requestRepository.findById(request_id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Repair request not found.' });
    }

    const existingReview = await reviewRepository.getByRequestId(request_id);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this repair request.'
      });
    }

    const customerId = req.user ? req.user.id : request.customer_id;
    const repairerId = request.repairer_id;

    const newReview = await reviewRepository.create({
      request_id,
      customer_id: customerId,
      repairer_id: repairerId,
      rating: numRating,
      review
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your rating and review!',
      data: newReview
    });
  } catch (error) {
    next(error);
  }
}

export async function getReviews(req, res, next) {
  try {
    const reviews = await reviewRepository.getAll();
    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
}
