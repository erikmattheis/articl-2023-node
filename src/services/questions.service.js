const httpStatus = require("http-status");
const { Question } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a question
 * @param {Object} questionBody
 * @returns {Promise<Question>}
 */
const createQuestion = async (questionBody) => {
  if (await Question.isEmailTaken(questionBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return Question.create(questionBody);
};

/**
 * Query for questions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryQuestions = async (filter, options) => {
  const questions = await Question.paginate(filter, options);
  return questions;
};

/**
 * Get question by id
 * @param {ObjectId} id
 * @returns {Promise<Question>}
 */
const getQuestionById = async (id) => {
  return Question.findById(id);
};

/**
 * Get question by email
 * @param {string} email
 * @returns {Promise<Question>}
 */
const getQuestionByEmail = async (email) => {
  return Question.findOne({ email });
};

/**
 * Update question by id
 * @param {ObjectId} questionId
 * @param {Object} updateBody
 * @returns {Promise<Question>}
 */
const updateQuestionById = async (questionId, updateBody, req) => {
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new ApiError(httpStatus.NOT_FOUND, "Question not found");
  }
  if (updateBody !== req.user._id && req.user.role !== "superadmin") {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to update this user");
  }

  Object.assign(question, updateBody);
  await question.save();
  return question;
};

/**
 * Delete question by id
 * @param {ObjectId} questionId
 * @returns {Promise<Question>}
 */
const deleteQuestionById = async (questionId) => {
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new ApiError(httpStatus.NOT_FOUND, "Question not found");
  }
  await question.deleteOne({id:questionId}});
  return question;
};

module.exports = {
  createQuestion,
  queryQuestions,
  getQuestionById,
  getQuestionByEmail,
  updateQuestionById,
  deleteQuestionById,
};
