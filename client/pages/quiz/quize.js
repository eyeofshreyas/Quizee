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

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function paletteClasses(navState) {
    switch (navState) {
        case 'CURRENT': return 'bg-primary-container text-on-primary-container ring-2 ring-primary ring-offset-2 scale-110';
        case 'ANSWERED': return 'bg-tertiary text-on-tertiary';
        case 'MARKED_FOR_REVIEW': return 'bg-primary text-on-primary';
        case 'ANSWERED_AND_REVIEW': return 'bg-error-container text-on-error-container';
        default: return 'bg-surface-container-high text-on-surface-variant';
    }
}

if (typeof document !== 'undefined') {
    requireAuth();

    const params = new URLSearchParams(window.location.search);
    const certId = params.get('certId');
    const quizType = params.get('type');

    if (!certId || !quizType) {
        window.location.href = '../certifications/certifications.html';
    } else {
        const state = {
            sessionId: null,
            questions: [],
            currentIndex: 0,
            answers: new Map(),
            markedForReview: new Set(),
            timeSpent: new Map(),
            questionEnteredAt: null,
            timerInterval: null
        };

        const els = {
            certTitle: document.getElementById('certTitle'),
            certLevelBadge: document.getElementById('certLevelBadge'),
            timerDisplay: document.getElementById('timerDisplay'),
            questionProgressText: document.getElementById('questionProgressText'),
            questionProgressBar: document.getElementById('questionProgressBar'),
            quizError: document.getElementById('quizError'),
            quizContent: document.getElementById('quizContent'),
            questionNumberBadge: document.getElementById('questionNumberBadge'),
            questionText: document.getElementById('questionText'),
            choicesGrid: document.getElementById('choicesGrid'),
            markReviewBtn: document.getElementById('markReviewBtn'),
            markReviewLabel: document.getElementById('markReviewLabel'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            paletteGrid: document.getElementById('paletteGrid'),
            answeredCount: document.getElementById('answeredCount'),
            flaggedCount: document.getElementById('flaggedCount'),
            remainingCount: document.getElementById('remainingCount'),
            submitBtn: document.getElementById('submitBtn'),
            resultsPanel: document.getElementById('resultsPanel'),
            resultScore: document.getElementById('resultScore'),
            resultAccuracy: document.getElementById('resultAccuracy'),
            resultCorrect: document.getElementById('resultCorrect'),
            resultWrong: document.getElementById('resultWrong'),
            resultPassed: document.getElementById('resultPassed'),
            resultsBreakdown: document.getElementById('resultsBreakdown')
        };

        function showError(message) {
            els.quizError.textContent = message;
            els.quizError.classList.remove('hidden');
        }

        function trackTimeOnCurrentQuestion() {
            if (state.questionEnteredAt === null || !state.questions.length) return;
            const q = state.questions[state.currentIndex];
            const elapsed = Math.round((Date.now() - state.questionEnteredAt) / 1000);
            state.timeSpent.set(q._id, (state.timeSpent.get(q._id) || 0) + elapsed);
        }

        function renderQuestion() {
            const q = state.questions[state.currentIndex];
            const selected = state.answers.get(q._id);

            els.questionNumberBadge.textContent = String(state.currentIndex + 1);
            els.questionText.textContent = q.text;
            els.questionProgressText.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
            els.questionProgressBar.style.width = `${((state.currentIndex + 1) / state.questions.length) * 100}%`;

            els.choicesGrid.innerHTML = q.options.map((opt, i) => `
                <div class="choice-card group cursor-pointer border rounded-xl p-lg bg-surface-container-lowest transition-all hover:border-primary active:scale-95 ${selected === i ? 'border-primary bg-primary/5' : 'border-outline-variant'}" data-index="${i}">
                    <div class="flex items-center gap-md">
                        <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors ${selected === i ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant'}">${CHOICE_LETTERS[i]}</div>
                        <span class="text-body-lg font-body-lg text-on-surface">${opt}</span>
                    </div>
                </div>
            `).join('');

            els.choicesGrid.querySelectorAll('.choice-card').forEach(card => {
                card.addEventListener('click', () => {
                    state.answers.set(q._id, Number(card.dataset.index));
                    renderQuestion();
                    renderPalette();
                });
            });

            const marked = state.markedForReview.has(q._id);
            els.markReviewLabel.textContent = marked ? 'Unmark Review' : 'Mark for Review';
            els.prevBtn.disabled = state.currentIndex === 0;
            els.nextBtn.textContent = state.currentIndex === state.questions.length - 1 ? 'Finish' : 'Next Question';
        }

        function renderPalette() {
            els.paletteGrid.innerHTML = state.questions.map((q, i) => {
                const navState = computeQuestionState(i, state.currentIndex, state.answers.has(q._id), state.markedForReview.has(q._id));
                return `<div class="palette-cell w-10 h-10 rounded-lg flex items-center justify-center font-label-md text-xs cursor-pointer ${paletteClasses(navState)}" data-index="${i}">${i + 1}</div>`;
            }).join('');

            els.paletteGrid.querySelectorAll('.palette-cell').forEach(cell => {
                cell.addEventListener('click', () => goToQuestion(Number(cell.dataset.index)));
            });

            let answered = 0;
            let flagged = 0;
            state.questions.forEach(q => {
                if (state.answers.has(q._id)) answered++;
                if (state.markedForReview.has(q._id)) flagged++;
            });
            els.answeredCount.textContent = String(answered);
            els.flaggedCount.textContent = String(flagged);
            els.remainingCount.textContent = String(state.questions.length - answered);
        }

        function goToQuestion(index) {
            if (index === state.currentIndex) return;
            trackTimeOnCurrentQuestion();
            state.currentIndex = index;
            state.questionEnteredAt = Date.now();
            renderQuestion();
            renderPalette();
        }

        els.prevBtn.addEventListener('click', () => goToQuestion(Math.max(0, state.currentIndex - 1)));
        els.nextBtn.addEventListener('click', () => {
            if (state.currentIndex === state.questions.length - 1) return; // Task 7 wires submit here
            goToQuestion(state.currentIndex + 1);
        });
        els.markReviewBtn.addEventListener('click', () => {
            const q = state.questions[state.currentIndex];
            if (state.markedForReview.has(q._id)) state.markedForReview.delete(q._id);
            else state.markedForReview.add(q._id);
            renderQuestion();
            renderPalette();
        });

        async function init() {
            try {
                const certification = await apiRequest(`/certifications/${certId}`);
                els.certTitle.textContent = certification.name;
                els.certLevelBadge.textContent = metaForCode(certification.code).level.toUpperCase();

                const created = await apiRequest('/quiz/create', {
                    method: 'POST',
                    body: { certificationId: certId, quizType }
                });
                state.sessionId = created.quizSession.sessionId;
                state.questions = created.quizSession.questions;
                state.currentIndex = 0;
                state.questionEnteredAt = Date.now();

                renderQuestion();
                renderPalette();
            } catch (err) {
                showError(err.message || 'Unable to start this quiz.');
            }
        }

        init();
    }
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
