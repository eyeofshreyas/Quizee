function computeQuestionState(index, currentIndex, isAnswered, isMarked) {
    if (index === currentIndex) return 'CURRENT';
    if (isAnswered && isMarked) return 'ANSWERED_AND_REVIEW';
    if (isAnswered) return 'ANSWERED';
    if (isMarked) return 'MARKED_FOR_REVIEW';
    return 'UNVISITED';
}

function buildSubmitAnswers(questions, answers, timeSpent) {
    return questions.map(q => ({
        question_id: q._id,
        selected_option: answers.has(q._id) ? answers.get(q._id) : -1,
        time_taken: timeSpent.get(q._id) || 0
    }));
}

function formatDuration(totalSeconds) {
    const clamped = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const seconds = clamped % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

if (typeof module !== 'undefined' && require.main === module) {
    const assert = require('assert');

    assert.strictEqual(computeQuestionState(2, 2, false, false), 'CURRENT');
    assert.strictEqual(computeQuestionState(0, 2, true, false), 'ANSWERED');
    assert.strictEqual(computeQuestionState(0, 2, false, true), 'MARKED_FOR_REVIEW');
    assert.strictEqual(computeQuestionState(0, 2, true, true), 'ANSWERED_AND_REVIEW');
    assert.strictEqual(computeQuestionState(0, 2, false, false), 'UNVISITED');

    const qs = [{ _id: 'q1' }, { _id: 'q2' }];
    const answers = new Map([['q1', 2]]);
    const timeSpent = new Map([['q1', 15]]);
    assert.deepStrictEqual(buildSubmitAnswers(qs, answers, timeSpent), [
        { question_id: 'q1', selected_option: 2, time_taken: 15 },
        { question_id: 'q2', selected_option: -1, time_taken: 0 }
    ]);

    assert.strictEqual(formatDuration(3661), '01:01:01');
    assert.strictEqual(formatDuration(59), '00:00:59');
    assert.strictEqual(formatDuration(0), '00:00:00');
    assert.strictEqual(formatDuration(-5), '00:00:00');

    console.log('quize.js self-check passed');
}
