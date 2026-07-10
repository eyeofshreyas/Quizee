# Quiz-taking flow: wire quize.html to the real backend

## Problem

`client/pages/quiz/quize.html`/`quize.js` is a fully static mock: one hardcoded
question, a decorative countdown, no calls to `POST /api/quiz/create` or
`POST /api/quiz/submit`, and no real navigator/timer state even though the
backend (`server/logic/quizEngine/`) fully supports practice and mock quizzes.
Every other major page (dashboard, leaderboard, progress, profile,
subscription) is more meaningful once real `QuizSession`/`Attempt` data
exists, so this is the highest-value remaining piece of frontend work.

## Backend changes

Both changes are additive to existing response payloads — no new routes, no
schema changes, no changes to what gets persisted to MongoDB.

### 1. `server/logic/quizEngine/createQuiz.js` — return full question content

`quizSession.questions` (the value returned to the API caller, not
`sessionDoc.questions` which stays as an ObjectId array for the DB write) is
currently `questions.map(q => q._id)` — IDs only. The frontend cannot render
a quiz from IDs alone. Change it to return sanitized question objects:

```js
{ _id, text, options, domain_id, difficulty }
```

Omit `correct_index` and `explanation` — the quiz is still in progress, so
the answer must not be leaked to the client before submit.

### 2. `server/logic/scoring/scoreCalculator.js` — include answer key in results

`calculate()` already fetches each `Question` doc inside its scoring loop.
Add `correct_index` and `explanation` to each `detailedResults` entry pushed.
This only changes the response payload (`attempt.results` in
`submitQuiz.js`'s return value) — the `Attempt` model's `answers` subschema
(`question_id`, `selected_option` only) ignores extra fields, so nothing new
persists to Mongo. Safe to reveal once the quiz is submitted.

No other backend changes. The navigator state machine
(`server/logic/quizEngine/navigator.js`, `updateState`/`getPalette`) stays
unused by the API for this pass — see "Navigator state" below.

## Frontend changes

### Entry point

`certifications.js`'s `certCardHtml` template currently links "Start
Practice" to `../quiz/quize.html` with no params. Change it to two links per
card:

- `../quiz/quize.html?certId=<cert._id>&type=practice`
- `../quiz/quize.html?certId=<cert._id>&type=mock` ("Start Mock Exam")

No domain/difficulty picker in this pass — `createQuiz` is called with just
`certificationId` + `quizType`. The sidebar "Study Domains" list on
`quize.html` stays decorative (unwired) for now.

### Shared helper dedupe

`metaForCode`/`CERT_META` (cert-code → level/icon lookup) currently lives in
`certifications.js`. Move it into `client/assets/api.js` so `quize.js` can
reuse it for the header's level badge instead of re-deriving it.

### `quize.js` — load sequence

1. `requireAuth()`.
2. Parse `certId` and `type` from the URL query string. If either is
   missing, redirect to `../certifications/certifications.html`.
3. `GET /api/certifications/:certId` — populates header (name, passing
   score, level badge via `metaForCode`).
4. `POST /api/quiz/create` with `{ certificationId, quizType }`. On a 403
   (subscription limit reached) or other failure, show an inline error with
   a link to the subscription page instead of a blank/broken page.

### Client-side state

Held in memory for the session (not persisted — see "Navigator state"
below):

- `questions[]` — from the create response, cached with full text/options.
- `navStates` — `Map<question_id, state>`, initialized the same way
  `navigator.initializeStates` does server-side (first question `CURRENT`,
  rest `UNVISITED`).
- `answers` — `Map<question_id, { selected_option, time_taken }>`.
- `currentIndex`, and per-question accumulated `time_taken` (time spent
  while a question is `CURRENT`).

Selecting a choice sets the answer and transitions the question's state to
`ANSWERED` (or `ANSWERED_AND_REVIEW` if it was already `MARKED_FOR_REVIEW`).
A "Mark for Review" toggle (new button, next to Previous/Next) is added so
`MARKED_FOR_REVIEW`/`ANSWERED_AND_REVIEW` are actually reachable — without
it, 2 of the 5 navigator states would be dead code. Previous/Next and
clicking a palette cell move `currentIndex` and update `CURRENT` transitions.

### Navigator state: client-side only

Per design discussion: no new backend routes. `navStates` lives in JS memory
only. A hard refresh mid-quiz loses palette/answer progress (the created
`QuizSession` row still exists server-side, but nothing lets the client
resume it in this pass). Per-question time is still delivered to the server
correctly, since `time_taken` is submitted per-answer at the end via the
existing `submitQuizSchema`.

### Timer

- `quizType === 'mock'`: real countdown seeded from
  `quizSession.duration`/`remainingTime` in the create response. Reaching
  zero auto-triggers submit (the server independently double-checks
  expiration via `timer.checkExpiration` in `quizService.submitQuiz`, so a
  client clock drift can't extend a session past the real deadline).
- `quizType === 'practice'`: count-up stopwatch only (cosmetic + feeds
  `time_taken`); practice sessions never expire server-side.

### Rendering

- `quize.html` markup: strip the hardcoded question/choices/palette-cell
  markup (JS-rendered from real data now); remove "Show Hint" (no `hint`
  field exists on the `Question` model); remove the always-visible
  Explanation callout (only shown post-submit now); add the "Mark for
  Review" button; add a hidden results-panel container.
- Palette sidebar cell count = `questions.length`, colored by `navStates`,
  click-to-jump. "SESSION STATUS" counts (answered/flagged/remaining)
  derived from `navStates`.

### Submit

Confirms via `confirm()` if any question is still unanswered. Builds the
`answers[]` payload from **all** session questions, not just answered ones:
unanswered questions are submitted with `selected_option: -1` — a sentinel
that can never equal a real `correct_index` (indices are `0..options.length
- 1`). This passes the existing `submitQuizSchema` (`Joi.number().required()`,
no lower bound) and makes `scoreCalculator` correctly score them as wrong
(currently, entirely-skipped questions are silently excluded from both
`correctAnswers` and `wrongAnswers` — this incidentally fixes that) while
still returning `correct_index`/`explanation` for every question, including
skipped ones, for the results view.

`POST /api/quiz/submit` with `{ sessionId, answers }`.

### Results (inline, not a redirect)

On success, replace the question view with a results panel on the same
page: score, pass/fail (`attempt.passed`), accuracy, correct/wrong counts,
and a per-question breakdown combining the client's cached
`questions[]` (text/options) with the response's `results[]`
(`selected_option`, `is_correct`, `correct_index`, `explanation`) —
"Your answer" vs. "Correct answer" + explanation, with a distinct "Skipped"
label where `selected_option === -1`. `progress.html` is out of scope for
this pass (still 100% mock) — no redirect there.

## Error handling

- Create fails (subscription limit, cert not found, lock contention) →
  inline error state, no crash.
- Submit fails (session expired, already completed, not found) → inline
  error state; expired-mid-quiz is handled by the timer's auto-submit path
  hitting this same error path if the server's expiry check beats the
  client's local countdown.

## Testing

Following the existing pattern in `api.js`/`certifications.js`: pull pure,
non-DOM logic — the `-1`-sentinel answer-building, palette
state-transition logic, and the relocated `metaForCode` — into standalone
functions with a `require.main === module` assert-based self-check block.
DOM rendering code itself is not unit-tested (no framework in this repo per
`CLAUDE.md`).

## Out of scope for this pass

- Domain/difficulty filtering at quiz creation.
- Persisting navigator state server-side (refresh-survives-quiz).
- Wiring `progress.html`, `dashboard.html`, `leaderboard.html`, `profile.html`
  to real data — separate follow-up tasks per the session summary.
