# Quizee 🚀

> **An AWS Certification Practice Exam Platform**

Quizee is a full-stack web application designed to help learners prepare for AWS certification exams through realistic practice questions, timed mock exams, performance analytics, XP rewards, badges, and leaderboards.

This project was developed as a collaborative academic project and portfolio demonstration by a team of four students.

> **Disclaimer:** Quizee is an independent educational project and is **not affiliated with or endorsed by Amazon Web Services (AWS).**

---

# 📖 Table of Contents

- Features
- Supported Certifications
- Tech Stack
- Project Structure
- Getting Started
- Installation
- Environment Variables
- Running the Project
- Testing
- API Overview
- Security
- Future Improvements
- Team
- Contributing
- License
- Disclaimer

---

# ✨ Features

- 🔐 Secure JWT Authentication
- 🔑 Password hashing with bcrypt
- 📝 Practice quiz mode
- ⏱️ Timed mock exams
- 📊 Automatic scoring
- 📈 Progress tracking
- ⭐ XP reward system
- 🏅 Achievement badges
- 🥇 Leaderboard ranking
- 💳 Subscription management
- 🎯 Certification-based question sets
- 📱 Responsive interface
- ⚡ RESTful API architecture

---

# ☁️ Supported AWS Certifications

- AWS Certified Cloud Practitioner (CLF-C02)
- AWS Certified Solutions Architect – Associate (SAA-C03)
- AWS Certified Developer – Associate (DVA-C02)

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (Vanilla)
- Tailwind CSS (CDN)

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JSON Web Tokens (JWT)
- bcrypt

## Validation

- Joi

---

# 📂 Project Structure

```
quizee/
│
├── client/
│   ├── assets/
│   │   ├── api.js
│   │   └── images/
│   │
│   └── pages/
│       ├── login/
│       ├── register/
│       ├── dashboard/
│       ├── quiz/
│       ├── progress/
│       ├── leaderboard/
│       ├── profile/
│       ├── subscription/
│       └── certifications/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── logic/
│   ├── middleware/
│   ├── validators/
│   ├── models/
│   └── tests/
│
├── package.json
└── README.md
```

> **Note:** Not every router inside `server/routes/` is mounted. Refer to `server/app.js` to see the active routes.

---

# 🚀 Getting Started

Clone the repository.

```bash
git clone https://github.com/your-username/quizee.git
```

Navigate to the project directory.

```bash
cd quizee
```

Install all dependencies.

```bash
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the **server** folder (or project root).

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

NODE_ENV=development
```

---

# ▶️ Running the Backend

Development mode

```bash
npm run dev
```

Production mode

```bash
npm start
```

The backend will run on:

```
http://localhost:5000
```

---

# 🌐 Running the Frontend

Since the frontend is built with plain HTML/CSS/JavaScript, serve it using:

```bash
npx serve client
```

Do **not** open the HTML files directly using `file://` because the frontend communicates with the backend using HTTP requests.

---

# 🧪 Testing

Run tests individually.

```bash
node server/tests/auth.test.js

node server/tests/quiz.test.js

node server/tests/quizConcurrency.test.js

node server/tests/scoreCalculator.test.js

node server/tests/atomicUpdates.test.js
```

Run the end-to-end verification.

```bash
npm run verify
```

The verification script performs a non-destructive smoke test using seeded MongoDB data and validates the complete flow:

- User creation
- Quiz attempt
- Score calculation
- Progress update
- Subscription limits
- XP calculation
- Badge generation

---

# 📡 API Overview

Major API modules include:

- Authentication
- Quiz Management
- Progress Tracking
- Leaderboards
- XP & Badges
- Certifications
- Subscription
- Payments

---

# 🔒 Security

The project follows several security best practices:

- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- Environment variables for secrets
- Input validation using Joi
- Secure MongoDB integration

---

# 🚀 Future Improvements

- Email verification
- Password reset
- Admin dashboard
- AI-generated practice questions
- Detailed analytics dashboard
- Dark mode
- Question bookmarking
- Certificate generation
- Multi-language support
- Docker deployment

---

# 👥 Team

Quizee was developed as a collaborative academic project by:

- **Shresh Shende**
- **Tejaswini Prakash**
- **Aishwarya Shirgavi**
- **Shreya Pandey**

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve Quizee:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push to your fork.
5. Open a Pull Request.

Please read **CONTRIBUTING.md** before submitting contributions.

---

# 📄 License

This project is licensed under the **MIT License**.

See the **LICENSE** file for more information.

---

# ⚠️ Disclaimer

AWS®, AWS Certified, Amazon Web Services®, and related names are trademarks of Amazon Web Services, Inc.

Quizee is an independent educational project created solely for academic learning and portfolio demonstration purposes. It is **not affiliated with, sponsored by, or endorsed by Amazon Web Services.**

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

Your support helps motivate future improvements and encourages open-source collaboration.