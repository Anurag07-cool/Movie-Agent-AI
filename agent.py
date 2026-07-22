import os
import json
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI

# ==========================================
# 1. DEFINE TOOLS (MovieMate)
# ==========================================

# Helper to fetch dynamic data from LLM to simulate a real movie database
def _fetch_from_llm(prompt: str) -> dict:
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ.get("GROQ_API_KEY", "your-groq-api-key"),
    )
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a factual movie database API. You MUST return REAL, authentic movie titles, cast members, and factual details from your world knowledge. Do not use generic placeholders like 'Movie 1'. Return ONLY valid JSON. Do not include markdown formatting or extra text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        return {"error": "Failed to fetch data."}

MOVIE_DB = {}

def search_movie(title: str) -> dict:
    print(f"--> [Tool Executed] search_movie(title='{title}')")
    res = _fetch_from_llm(f'Return a JSON object for the movie "{title}". Keys required: "title", "release_year", "genre".')
    movie_id = hash(title) % 100000
    MOVIE_DB[movie_id] = res.get("title", title)
    res["movie_id"] = movie_id
    return res

def get_movie_details(movie_id: int) -> dict:
    print(f"--> [Tool Executed] get_movie_details(movie_id={movie_id})")
    title = MOVIE_DB.get(movie_id, f"Unknown Movie {movie_id}")
    return _fetch_from_llm(f'Return a JSON object for the movie "{title}". Keys required: "plot", "cast" (list of strings), "director", "runtime", "genres" (list), "language", "imdb_rating".')

def get_similar_movies(movie_id: int) -> list:
    print(f"--> [Tool Executed] get_similar_movies(movie_id={movie_id})")
    title = MOVIE_DB.get(movie_id, f"Unknown Movie {movie_id}")
    res = _fetch_from_llm(f'Return a JSON object with a single key "similar" containing a list of 4 movie titles similar to "{title}".')
    return res.get("similar", [])

def search_by_genre(genre: str) -> list:
    print(f"--> [Tool Executed] search_by_genre(genre='{genre}')")
    res = _fetch_from_llm(f'Return a JSON object with a single key "movies" containing a list of 4 popular movies in the genre "{genre}".')
    return res.get("movies", [])

def search_by_actor(actor: str) -> list:
    print(f"--> [Tool Executed] search_by_actor(actor='{actor}')")
    res = _fetch_from_llm(f'Return a JSON object with a single key "movies" containing a list of 3 popular movies featuring "{actor}".')
    return res.get("movies", [])

def get_trending_movies() -> list:
    print("--> [Tool Executed] get_trending_movies()")
    res = _fetch_from_llm('Return a JSON object with a single key "movies" containing a list of 3 currently trending movies globally.')
    return res.get("movies", [])

def get_streaming_platform(movie_id: int) -> list:
    print(f"--> [Tool Executed] get_streaming_platform(movie_id={movie_id})")
    title = MOVIE_DB.get(movie_id, f"Unknown Movie {movie_id}")
    res = _fetch_from_llm(f'Return a JSON object with a single key "platforms" containing a list of streaming platforms for the movie "{title}".')
    return res.get("platforms", ["Netflix", "Prime Video"])

def get_reviews(movie_id: int) -> dict:
    print(f"--> [Tool Executed] get_reviews(movie_id={movie_id})")
    title = MOVIE_DB.get(movie_id, f"Unknown Movie {movie_id}")
    return _fetch_from_llm(f'Return a JSON object for reviews of movie "{title}". Keys required: "critic_score", "audience_score", "consensus".')

def get_box_office(movie_id: int) -> str:
    print(f"--> [Tool Executed] get_box_office(movie_id={movie_id})")
    title = MOVIE_DB.get(movie_id, f"Unknown Movie {movie_id}")
    res = _fetch_from_llm(f'Return a JSON object with a single key "box_office" containing the box office collection string for movie "{title}".')
    return res.get("box_office", "Unknown")

def recommend_movie(preferences: str) -> list:
    print(f"--> [Tool Executed] recommend_movie(preferences='{preferences}')")
    res = _fetch_from_llm(f'Return a JSON object with a single key "movies" containing a list of 3 movie recommendations based on user preferences: "{preferences}".')
    return res.get("movies", [])

# Tool Mapping for Execution
AVAILABLE_FUNCTIONS = {
    "search_movie": search_movie,
    "get_movie_details": get_movie_details,
    "get_similar_movies": get_similar_movies,
    "search_by_genre": search_by_genre,
    "search_by_actor": search_by_actor,
    "get_trending_movies": get_trending_movies,
    "get_streaming_platform": get_streaming_platform,
    "get_reviews": get_reviews,
    "get_box_office": get_box_office,
    "recommend_movie": recommend_movie
}

# OpenAI Tool Schemas
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_movie",
            "description": "Search for a movie by title. Returns Movie ID, Title, Release Year, Genre.",
            "parameters": {
                "type": "object",
                "properties": {"title": {"type": "string"}},
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_movie_details",
            "description": "Fetch complete movie details. Returns Plot, Cast, Director, Runtime, Genres, Language, IMDb Rating.",
            "parameters": {
                "type": "object",
                "properties": {"movie_id": {"type": "integer"}},
                "required": ["movie_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_similar_movies",
            "description": "Recommend movies similar to another movie. Returns a list of similar movies.",
            "parameters": {
                "type": "object",
                "properties": {"movie_id": {"type": "integer"}},
                "required": ["movie_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_by_genre",
            "description": "Find movies in a particular genre. Returns top movies in that genre.",
            "parameters": {
                "type": "object",
                "properties": {"genre": {"type": "string"}},
                "required": ["genre"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_by_actor",
            "description": "Find movies featuring a particular actor. Returns Actor filmography.",
            "parameters": {
                "type": "object",
                "properties": {"actor": {"type": "string"}},
                "required": ["actor"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_trending_movies",
            "description": "Fetch currently trending movies.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_streaming_platform",
            "description": "Find where a movie is available.",
            "parameters": {
                "type": "object",
                "properties": {"movie_id": {"type": "integer"}},
                "required": ["movie_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_reviews",
            "description": "Fetch audience and critic reviews.",
            "parameters": {
                "type": "object",
                "properties": {"movie_id": {"type": "integer"}},
                "required": ["movie_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_box_office",
            "description": "Fetch box office collection.",
            "parameters": {
                "type": "object",
                "properties": {"movie_id": {"type": "integer"}},
                "required": ["movie_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recommend_movie",
            "description": "Generate personalized recommendations using user preferences.",
            "parameters": {
                "type": "object",
                "properties": {"preferences": {"type": "string"}},
                "required": ["preferences"]
            }
        }
    }
]

# ==========================================
# 2. MAIN AGENT LOGIC
# ==========================================
def main():
    print("========================================")
    print("          Welcome to MovieMate!         ")
    print("========================================")
    
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ.get("GROQ_API_KEY", "your-groq-api-key"),
    )
    
    system_instruction = """
    You are MovieMate, an autonomous AI Movie Recommendation Agent.
    Your primary responsibility is NOT to answer directly.
    Your responsibility is to determine which tool(s) should be used to satisfy the user's request.
    You have access to multiple external tools.
    Always prefer using tools over guessing.

    AGENT RULES:
    Rule 1: Never invent movie information. If information can be retrieved from a tool, call the tool.
    Rule 2: If the user asks multiple questions, call multiple tools in sequence.
    Rule 3: If one tool depends on another, always execute them in order (e.g. search_movie -> get_similar_movies).
    Rule 4: If the user asks "Best action movies", use search_by_genre("Action") NOT search_movie().
    Rule 5: If the user asks "Movies starring Tom Cruise", use search_by_actor().
    Rule 6: If the user asks "What's trending today?", use get_trending_movies().
    Rule 7: If the user asks "Where can I watch Oppenheimer?", Tool sequence: search_movie() -> get_streaming_platform().
    Rule 8: If the user asks "Should I watch Interstellar?", Tool sequence: search_movie() -> get_movie_details() -> get_reviews() -> Generate a balanced recommendation.
    Rule 9: If information is missing, ask ONE clarification question.
    Rule 10: You may call multiple tools until enough information is collected. Only after all required tools have been executed should you generate the final response.

    OUTPUT FORMAT:
    Never expose internal reasoning. Only use tool outputs to answer.
    """

    print("\nMovieMate initialized via Groq API! (Type 'exit' to quit)")
    
    while True:
        user_query = input("\nEnter your query: ")
        if user_query.lower() in ['exit', 'quit']:
            break

        print("\n[MovieMate is thinking & running tools...]")
        
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_query}
        ]

        try:
            while True:
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    tools=tools,
                    temperature=0.1
                )
                
                response_message = response.choices[0].message
                
                # If there are no tool calls, this is the final answer
                if not response_message.tool_calls:
                    print("\n[Final Output]")
                    print(response_message.content)
                    break
                
                # Append the assistant's tool call message
                messages.append(response_message)
                
                # Execute tools and append results
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    function_to_call = AVAILABLE_FUNCTIONS.get(function_name)
                    if function_to_call:
                        # Extract arguments safely
                        try:
                            function_args = json.loads(tool_call.function.arguments)
                            if not isinstance(function_args, dict):
                                function_args = {}
                        except (json.JSONDecodeError, TypeError):
                            function_args = {}
                            
                        function_response = function_to_call(**function_args)
                        
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps(function_response)
                        })
                    else:
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps({"error": "Function not found."})
                        })
                        
        except Exception as e:
            print(f"\n[Error occurred] {e}")
            break

if __name__ == "__main__":
    main()
