# Webora — AI Website Builder

Webora is an AI-powered website builder built using the MERN stack. Describe your website in plain English, and AI generates a complete, responsive website instantly. Edit text directly on the live preview, save your projects, and publish them to the community.

## Features

- AI-powered website generation from text prompts
- User authentication (signup/login)
- Save and manage multiple projects
- Visual editor — click and edit text directly on the website
- Download generated websites as HTML files
- Publish projects to a public community page
- Responsive preview (desktop, tablet, mobile)

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**AI:** OpenRouter API  
**Auth:** JWT, bcrypt

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas account
- OpenRouter API key

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd webora
```

2. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

```bash
npm run dev
```

3. Setup the frontend
```bash
cd ../client
npm install
npm run dev
```

4. Open `http://localhost:5173` in your browser

## License

This project is for educational purposes.