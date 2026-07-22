from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI
from agent import AVAILABLE_FUNCTIONS, tools

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: list

system_instruction = """
You are MovieMate, an autonomous AI Movie Recommendation Agent.
Your primary responsibility is NOT to answer directly.
Your responsibility is to determine which tool(s) should be used to satisfy the user's request.
You have access to multiple external tools.
Always prefer using tools over guessing.

AGENT RULES:
Rule 1: Never invent movie information. If information can be retrieved from a tool, call the tool.
Rule 2: If the user asks multiple questions, call multiple tools in sequence.
Rule 3: If one tool depends on another, always execute them in order.
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

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY", "your-groq-api-key"),
)

async def generate_chat_stream(history: list):
    # Prepare the message payload for Groq
    messages = [{"role": "system", "content": system_instruction}]
    
    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Yield initial thinking state
    yield f"data: {json.dumps({'type': 'thinking'})}\n\n"
    
    try:
        while True:
            # We must use run_in_executor to not block the async event loop with synchronous OpenAI calls
            response = await asyncio.to_thread(
                client.chat.completions.create,
                model="llama-3.1-8b-instant",
                messages=messages,
                tools=tools,
                temperature=0.1
            )
            
            response_message = response.choices[0].message
            
            if not response_message.tool_calls:
                # Final answer
                yield f"data: {json.dumps({'type': 'final_answer', 'content': response_message.content})}\n\n"
                break
                
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                function_to_call = AVAILABLE_FUNCTIONS.get(function_name)
                
                # Notify frontend that tool is running
                yield f"data: {json.dumps({'type': 'tool_running', 'tool': f'{function_name}()'})}\n\n"
                
                if function_to_call:
                    try:
                        function_args = json.loads(tool_call.function.arguments)
                        if not isinstance(function_args, dict):
                            function_args = {}
                    except (json.JSONDecodeError, TypeError):
                        function_args = {}
                        
                    # Execute tool
                    function_response = await asyncio.to_thread(function_to_call, **function_args)
                    
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps(function_response)
                    })
                    
                    # Notify frontend tool is done
                    yield f"data: {json.dumps({'type': 'tool_done', 'tool': f'{function_name}()', 'result': function_response})}\n\n"
                else:
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": json.dumps({"error": "Function not found."})
                    })
                    yield f"data: {json.dumps({'type': 'tool_done', 'tool': f'{function_name}()', 'result': 'error'})}\n\n"
                    
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(generate_chat_stream(request.messages), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
