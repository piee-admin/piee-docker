"""
Abstract adapter layer for LLM providers with BYOK support.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
import json

class LLMProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, model: str, api_key: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate completion using the provider's API."""
        pass

class OpenAIProvider(LLMProvider):
    async def generate(self, prompt: str, model: str, api_key: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Call OpenAI API with user's API key."""
        import time
        start_time = time.time()
        
        # Parse parameters
        params = json.loads(parameters) if parameters else {}
        temperature = params.get("temperature", 0.7)
        max_tokens = params.get("max_tokens", 1000)
        
        # Make real API call to OpenAI
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract usage and response
                usage = data.get("usage", {})
                completion = data["choices"][0]["message"]["content"]
                
                # Calculate cost (simplified - in production, use accurate pricing)
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
                cost = self._calculate_cost(model, prompt_tokens, completion_tokens)
                
                latency_ms = int((time.time() - start_time) * 1000)
                
                return {
                    "text": completion,
                    "model": model,
                    "tokens_prompt": prompt_tokens,
                    "tokens_completion": completion_tokens,
                    "cost": cost,
                    "latency_ms": latency_ms
                }
            except httpx.HTTPStatusError as e:
                raise Exception(f"OpenAI API error: {e.response.status_code} - {e.response.text}")
            except Exception as e:
                raise Exception(f"OpenAI API call failed: {str(e)}")
    
    def _calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> int:
        """Calculate cost in micro-credits (1 credit = 1,000,000 micro-credits)."""
        # Simplified pricing (update with real pricing)
        if "gpt-4" in model.lower():
            prompt_cost = prompt_tokens * 30  # $0.03 per 1K tokens
            completion_cost = completion_tokens * 60  # $0.06 per 1K tokens
        else:  # gpt-3.5-turbo
            prompt_cost = prompt_tokens * 1.5  # $0.0015 per 1K tokens
            completion_cost = completion_tokens * 2  # $0.002 per 1K tokens
        
        return int(prompt_cost + completion_cost)

class AnthropicProvider(LLMProvider):
    async def generate(self, prompt: str, model: str, api_key: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Call Anthropic API with user's API key."""
        import time
        start_time = time.time()
        
        params = json.loads(parameters) if parameters else {}
        temperature = params.get("temperature", 0.7)
        max_tokens = params.get("max_tokens", 1000)
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                
                completion = data["content"][0]["text"]
                usage = data.get("usage", {})
                
                latency_ms = int((time.time() - start_time) * 1000)
                
                return {
                    "text": completion,
                    "model": model,
                    "tokens_prompt": usage.get("input_tokens", 0),
                    "tokens_completion": usage.get("output_tokens", 0),
                    "cost": self._calculate_cost(model, usage.get("input_tokens", 0), usage.get("output_tokens", 0)),
                    "latency_ms": latency_ms
                }
            except Exception as e:
                raise Exception(f"Anthropic API call failed: {str(e)}")
    
    def _calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> int:
        """Calculate cost in micro-credits."""
        # Simplified Anthropic pricing
        prompt_cost = prompt_tokens * 8  # $0.008 per 1K tokens
        completion_cost = completion_tokens * 24  # $0.024 per 1K tokens
        return int(prompt_cost + completion_cost)

def get_provider(provider_name: str) -> LLMProvider:
    """Get provider instance by name."""
    providers = {
        "openai": OpenAIProvider(),
        "anthropic": AnthropicProvider(),
    }
    provider = providers.get(provider_name.lower())
    if not provider:
        raise ValueError(f"Provider {provider_name} not supported")
    return provider
