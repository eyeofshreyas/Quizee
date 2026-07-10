# Quizee

An AWS certification practice-exam platform. Practice questions and timed mock exams for CLF-C02, SAA-C03, and DVA-C02, with scoring, progress tracking, XP/badges, and leaderboards.

## Stack

- **Client**: static HTML/CSS/JS (no build step, no framework), Tailwind via CDN
- **Server**: Node.js + Express, MongoDB via Mongoose
- **Auth**: JWT bearer tokens, bcrypt password hashing

## Project structure

```
quizee/
├── client/              static pages, one folder per screen under pages/
│   ├── assets/          shared api.js fetch layer, images
│   └── pages/           login, register, dashboard, quiz, progress, leaderboard, profile, subscription, certifications
├── server/
│   ├── routes/          Express routers (auth, quiz, progress, leaderboard, badges, certifications, subscription, payments)
│   ├── controllers/     thin HTTP handlers, delegate to services
│   ├── services/        adapt HTTP params to logic engines
│   ├── logic/           business rules — quizEngine, scoring, progress, xp, badges, leaderboard, recommendation, subscription
│   ├── models/          Mongoose schemas
│   ├── middleware/      JWT auth (protect), request validation
│   ├── validators/      Joi schemas
│   └── tests/           plain Node scripts using assert, run individually
├── package.json         npm workspace root (server is the only member)
       
```

Not every router in `server/routes/` is wired up — check `server/app.js` for what's actually mounted.

## Running it

**Backend** (from repo root):

```bash
npm install
npm run dev      # nodemon server.js
# or: npm start  # node server.js
```

Requires `server/.env` (or root `.env`) with:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Frontend** — plain static files, serve them (don't open via `file://`, the client fetches `http://localhost:5000/api` and needs a real origin):

```bash
npx serve client
```

## Testing

No test framework is installed. Tests live in `server/tests/*.test.js` and run individually with Node's built-in `assert`:

```bash
node server/tests/atomicUpdates.test.js
node server/tests/auth.test.js
node server/tests/quizConcurrency.test.js
node server/tests/quiz.test.js
node server/tests/scoreCalculator.test.js
```

Some mock Mongoose model methods in-process and need no DB; others hit real MongoDB.

`npm run verify` runs `server/logic/verify.js`, an end-to-end smoke test against the real configured MongoDB using seeded data — exercises the full create → answer → submit → score → progress → subscription-limit flow. Non-destructive.

## License

Built for educational purposes and portfolio demonstration. AWS is a trademark of Amazon Web Services; Quizee is not affiliated with or endorsed by AWS.
