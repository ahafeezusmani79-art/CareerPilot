# CareerPilot 🚀

**An AI-powered career development platform built with the MERN stack, Google Gemini, and Python.**

CareerPilot helps users organize their career journey through AI-powered career guidance, resume tools, and job application tracking.

🌐 **Live Demo:** https://careerpilot-kohl-six.vercel.app/

📂 **GitHub Repository:** https://github.com/ahafeezusmani79-art/CareerPilot

---

## ✨ Features

### 🤖 AI Career Assistant
- Get personalized career guidance.
- Ask questions about career planning and professional development.
- Receive guidance on technical learning roadmaps and interview preparation.
- Powered by Google Gemini.

### 📄 Resume Builder
- Create and manage your professional resume.
- Organize your career information.
- Prepare resume content for professional use.

### 🔍 Resume Analyzer
- Analyze resume content.
- Identify missing resume sections.
- Review strengths and areas for improvement.
- Compare resume keywords with a job description.
- Powered by a Python FastAPI analysis service.

### ✨ AI Resume Improvement
- Generate improved resume content using Google Gemini.
- Get suggestions for professional summaries, projects, experience, and skills.
- Receive recommendations tailored to a job description.

### 💼 Job Tracker
- Organize job applications.
- Manage application information and track your job search.

### 🔐 Authentication
- User registration and login.
- JWT-based authentication.
- Password hashing with bcryptjs.
- Protected application routes.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Vite | Frontend development and build |
| Tailwind CSS | Styling |
| React Router | Client-side navigation |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | Database modeling |
| Google Gemini | AI career assistant and resume improvement |
| Python | Resume analysis service |
| FastAPI | Python API framework |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## 🏗️ Project Structure

```text
CareerPilot/
│
├── ai-service/
│   ├── main.py
│   └── requirements.txt
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── vercel.json
```

---

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ahafeezusmani79-art/CareerPilot.git
cd CareerPilot
```

### 2. Set up the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs locally at:

`http://localhost:5173`

### 3. Set up the backend

Open another terminal:

```bash
cd CareerPilot/server
npm install
```

Create a `.env` file inside the `server` directory.

Configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PYTHON_AI_URL=http://localhost:8000
```

Use your own credentials. Never commit your `.env` file.

Start the backend:

```bash
npm run dev
```

Backend runs locally at:

`http://localhost:5000`

### 4. Set up the Python AI service

Open another terminal:

```bash
cd CareerPilot/ai-service
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
python -m uvicorn main:app --reload --port 8000
```

The AI service runs at:

`http://localhost:8000`

API documentation:

`http://localhost:8000/docs`

---

## 🔌 Backend API Routes

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/users` | User management |
| `/api/jobs` | Job application management |
| `/api/ai` | AI features and resume analysis |
| `/api/chats` | Career assistant chat history |
| `/api/resumes` | Resume management |

Most application routes require authentication.

---

## 🧠 What I Learned

While developing CareerPilot, I gained practical experience with:

- Building a full-stack application using the MERN stack.
- Designing and integrating REST APIs.
- Working with MongoDB and Mongoose.
- Implementing user authentication and protected routes.
- Integrating Google Gemini into application features.
- Connecting a Python FastAPI service with a Node.js backend.
- Managing frontend and backend communication.
- Organizing a multi-service application.

---

## 🚀 Future Improvements

- Further improve the resume analysis experience.
- Enhance the user dashboard.
- Add more career planning features.
- Improve application analytics and reporting.

---

## 👨‍💻 Developer

**Abdul Hafeez Usmani**

BS Computer Science Student | Full-Stack Developer | AI Enthusiast

- GitHub: https://github.com/ahafeezusmani79-art
- Project: https://github.com/ahafeezusmani79-art/CareerPilot

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with dedication and continuous learning.**
