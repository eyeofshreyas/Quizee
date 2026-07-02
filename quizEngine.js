
class QuizEngine {
    constructor(questions = [], quizType = "practice") {
        this.questions = questions;
        this.quizType = quizType;

        this.currentQuestion = 0;

        this.answers = [];

        this.questionStates = questions.map(() => ({
            visited: false,
            answered: false,
            markedForReview: false,
            selectedOption: null
        }));

        this.startTime = null;
        this.endTime = null;
    }

    startQuiz() {
        this.startTime = new Date();
    }

    visitQuestion(index) {
        this.currentQuestion = index;
        this.questionStates[index].visited = true;
    }

    answerQuestion(index, selectedOption) {
        this.questionStates[index].answered = true;
        this.questionStates[index].selectedOption = selectedOption;

        this.answers[index] = {
            questionId: this.questions[index]._id,
            selectedOption
        };
    }

    toggleReview(index) {
        this.questionStates[index].markedForReview =
            !this.questionStates[index].markedForReview;
    }

    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1)
            this.currentQuestion++;
    }

    previousQuestion() {
        if (this.currentQuestion > 0)
            this.currentQuestion--;
    }

    submitQuiz() {
        this.endTime = new Date();

        return {
            answers: this.answers,
            timeTaken:
                (this.endTime - this.startTime) / 1000
        };
    }
}

module.exports = QuizEngine;