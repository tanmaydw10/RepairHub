import { analyzeProblemWithAI } from '../services/aiService.js';

export async function diagnoseProblem(req, res, next) {
  try {
    const { problem, category } = req.body;

    if (!problem || problem.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear description of the issue (at least 5 characters).'
      });
    }

    const diagnosis = await analyzeProblemWithAI(problem, category);

    return res.json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    next(error);
  }
}
