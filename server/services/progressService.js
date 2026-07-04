const mongoose = require('mongoose');
const UserProgress = require('../models/UserProgress');
const Attempt = require('../models/Attempt');
const Domain = require('../models/Domain');
const ApiError = require('../utils/ApiError');

const getOverview = async ({ userId, certificationId }) => {
  const progress = await UserProgress.findOne({ user_id: userId, cert_id: certificationId });

  if (!progress) {
    return {
      questions_solved: 0,
      correct_answers: 0,
      accuracy: 0,
      study_time: 0,
      last_activity: null
    };
  }

  return progress;
};

const getDomainBreakdown = async ({ userId, certificationId }) => {
  const attempts = await Attempt.find({ user_id: userId, cert_id: certificationId });

  if (!attempts.length) {
    return [];
  }

  // Flatten all answers across all attempts, tagging correctness
  const questionResults = [];
  attempts.forEach(attempt => {
    attempt.answers.forEach(ans => {
      questionResults.push(ans.question_id);
    });
  });

  // Re-fetch attempts' embedded results is not available on Attempt schema directly
  // (Attempt only stores answers, not is_correct) — so we recompute correctness
  // by joining with Question.correct_index
  const Question = require('../models/Question');
  const questionIds = [...new Set(questionResults.map(id => id.toString()))];
  const questions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

  const domainStats = new Map(); // domain_id -> { correct, total }

  attempts.forEach(attempt => {
    attempt.answers.forEach(ans => {
      const question = questionMap.get(ans.question_id.toString());
      if (!question) return;

      const domainId = question.domain_id.toString();
      const isCorrect = question.correct_index === ans.selected_option;

      if (!domainStats.has(domainId)) {
        domainStats.set(domainId, { correct: 0, total: 0 });
      }
      const stat = domainStats.get(domainId);
      stat.total += 1;
      if (isCorrect) stat.correct += 1;
    });
  });

  const domainIds = [...domainStats.keys()];
  const domains = await Domain.find({ _id: { $in: domainIds } });
  const domainNameMap = new Map(domains.map(d => [d._id.toString(), d.name]));

  const breakdown = domainIds.map(domainId => {
    const stat = domainStats.get(domainId);
    return {
      domain_id: domainId,
      domain_name: domainNameMap.get(domainId) || 'Unknown',
      questions_attempted: stat.total,
      correct_answers: stat.correct,
      accuracy: stat.total > 0 ? Number(((stat.correct / stat.total) * 100).toFixed(2)) : 0
    };
  });

  return breakdown.sort((a, b) => a.accuracy - b.accuracy); // weakest domains first
};

module.exports = { getOverview, getDomainBreakdown };