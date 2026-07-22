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
    model: str = "llama-3.3-70b-versatile"

system_instruction = """
You are MovieMate, an autonomous AI Movie Recommendation Agent.
You have access to a variety of external tools to fetch movie data, genres, actors, trending lists, and reviews.
Always use these tools to look up real, factual information before answering the user.
Never invent or guess movie details.
If you need more information to use a tool, ask the user a clarifying question.

CRITICAL RULE: You MUST ONLY talk about movies, actors, directors, and cinema. 
If the user asks about ANYTHING else (e.g. coding, sports, weather, general knowledge), you must politely refuse and guide them back to movies.
"""

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY", "your-groq-api-key"),
)

async def generate_chat_stream(history: list, model: str):
    # Prepare the message payload for Groq
    messages = [{"role": "system", "content": system_instruction}]
    
    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Yield initial thinking state
    yield f"data: {json.dumps({'type': 'thinking'})}\n\n"
    
    try:
        max_iterations = 5
        iterations = 0
        
        while iterations < max_iterations:
            iterations += 1
            
            # Rate limit retry loop
            max_retries = 3
            retry_count = 0
            response = None
            
            while retry_count < max_retries:
                try:
                    # We must use run_in_executor to not block the async event loop with synchronous OpenAI calls
                    response = await asyncio.to_thread(
                        client.chat.completions.create,
                        model=model,
                        messages=messages,
                        tools=tools,
                        temperature=0.1
                    )
                    break
                except Exception as e:
                    error_str = str(e).lower()
                    if "rate limit" in error_str or "429" in error_str:
                        retry_count += 1
                        yield f"data: {json.dumps({'type': 'tool_running', 'tool': f'Rate limit reached. Waiting 3s (Retry {retry_count}/{max_retries})...'})}\n\n"
                        await asyncio.sleep(3)
                    elif "tool_use_failed" in error_str and "failed_generation" in error_str:
                        import re
                        match = re.search(r'<function=([a-zA-Z0-9_]+)(.*)', str(e))
                        if match:
                            func_name = match.group(1)
                            func_args_str = match.group(2).split('</function>')[0].replace('>', '', 1).strip()
                            if not func_args_str:
                                func_args_str = "{}"
                                
                            class DummyFunction:
                                def __init__(self, name, arguments):
                                    self.name = name
                                    self.arguments = arguments
                            class DummyToolCall:
                                def __init__(self, id, function):
                                    self.id = id
                                    self.type = "function"
                                    self.function = function
                            class DummyMessage:
                                def __init__(self, tool_calls):
                                    self.role = "assistant"
                                    self.content = None
                                    self.tool_calls = tool_calls
                                    
                                def dict(self):
                                    return {
                                        "role": self.role,
                                        "content": self.content,
                                        "tool_calls": [{"id": tc.id, "type": tc.type, "function": {"name": tc.function.name, "arguments": tc.function.arguments}} for tc in self.tool_calls]
                                    }
                            class DummyChoice:
                                def __init__(self, message):
                                    self.message = message
                            class DummyResponse:
                                def __init__(self, choices):
                                    self.choices = choices
                                    
                            import uuid
                            t_id = "call_" + str(uuid.uuid4())[:8]
                            dummy_msg = DummyMessage([DummyToolCall(t_id, DummyFunction(func_name, func_args_str))])
                            response = DummyResponse([DummyChoice(dummy_msg)])
                            break
                        else:
                            raise e
                    else:
                        raise e
            
            if not response:
                yield f"data: {json.dumps({'type': 'error', 'content': 'Rate limit exceeded. Please try again later.'})}\n\n"
                break
                
            response_message = response.choices[0].message
            
            if not response_message.tool_calls:
                # Final answer
                yield f"data: {json.dumps({'type': 'final_answer', 'content': response_message.content})}\n\n"
                break
                
            clean_msg = {
                "role": "assistant",
                "content": response_message.content or ""
            }
            if hasattr(response_message, "tool_calls") and response_message.tool_calls:
                clean_msg["tool_calls"] = [
                    {
                        "id": tc.id, 
                        "type": "function", 
                        "function": {"name": tc.function.name, "arguments": tc.function.arguments}
                    } for tc in response_message.tool_calls
                ]
            messages.append(clean_msg)
            
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
                    
        # If we broke out of loop due to max_iterations
        if iterations >= max_iterations:
            yield f"data: {json.dumps({'type': 'final_answer', 'content': 'I had to stop searching because I reached my limit. Here is the information I found so far.'})}\n\n"
            
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(generate_chat_stream(request.messages, request.model), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
