# MovieMate AI

MovieMate is an autonomous AI Movie Recommendation Agent powered by Llama 3 (via Groq API) and a modern React/Vite frontend. It uses advanced tool-calling and reasoning capabilities to search for movies, cast, genres, and box office details, and returns highly accurate, factual recommendations.

## Architecture
- **Backend**: FastAPI + Python
- **AI Agent**: Groq SDK (`llama3-70b-8192` for high-speed native tool calling)
- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion

## Features
- 🧠 **Autonomous Reasoning**: The agent dynamically calls multiple tools (e.g., `search_movie`, `get_similar_movies`, `get_streaming_platform`) to gather facts before answering.
- ⚡ **Real-time SSE Streaming**: The UI streams the agent's internal thought process and tool execution timeline live.
- 🎨 **Premium UI**: Built with a sleek, dark-mode glassmorphism design.

## Running Locally

1. **Start the Backend**
```bash
pip install fastapi uvicorn openai
python api.py
```
*(The backend runs on http://127.0.0.1:8000)*

2. **Start the Frontend**
```bash
cd moviemate-ui
npm install
npm run dev
```
*(The frontend runs on http://localhost:5173)*

## Tool Capabilities
- `search_movie(title)`
- `get_movie_details(movie_id)`
- `get_similar_movies(movie_id)`
- `search_by_genre(genre)`
- `search_by_actor(actor)`
- `get_trending_movies()`
- `get_streaming_platform(movie_id)`
- `get_reviews(movie_id)`
- `get_box_office(movie_id)`
- `recommend_movie(preferences)`
