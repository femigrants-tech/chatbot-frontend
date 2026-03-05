# AI Model Configuration - Gemini 2.5 Flash

This frontend is configured to work with **Gemini 2.5 Flash** AI model for the RAG chatbot backend.

## 🤖 Model Information

**Model**: Gemini 2.5 Flash  
**Provider**: Google AI  
**Type**: Large Language Model with RAG capabilities  
**Use Case**: Fast, efficient responses for document-based Q&A

## ⚙️ Configuration

### Environment Variables

The AI model is configured via environment variables in `.env`:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# AI Model (Gemini 2.5 Flash)
VITE_AI_MODEL=gemini-2.5-flash

# App Name
VITE_APP_NAME=Femibot AI Assistant
```

### How It Works

1. **Frontend** sends chat requests to the backend with model specification
2. **Backend** uses the specified model (Gemini 2.5 Flash) to process queries
3. **RAG System** retrieves relevant documents and generates responses
4. **Frontend** displays responses with source citations

## 📝 Model Display

The AI model name is displayed in the chat interface header:
- Shows "Powered by gemini-2.5-flash"
- Provides transparency about which AI is being used
- Can be customized via environment variables

## 🔧 Changing the Model

To use a different model, update `.env`:

```bash
# Example: Use a different model
VITE_AI_MODEL=gemini-1.5-pro
# or
VITE_AI_MODEL=gpt-4
# or
VITE_AI_MODEL=claude-3-sonnet
```

**Note**: The backend must support the model you specify!

## 🚀 Backend Configuration

Ensure your backend is configured to use Gemini 2.5 Flash:

### Backend Setup (Example)

```python
# In your backend code
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

# Use in RAG pipeline
@app.post("/chat")
async def chat(request: ChatRequest):
    # Retrieve relevant documents
    context = retrieve_documents(request.message)
    
    # Generate response with Gemini 2.5 Flash
    response = model.generate_content(
        prompt=create_prompt(request.message, context),
        temperature=0.7
    )
    
    return {
        "response": response.text,
        "context_used": context
    }
```

## 📊 API Request Format

When the frontend sends a chat request, it includes the model:

```json
{
  "message": "What is machine learning?",
  "chat_context": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "model": "gemini-2.5-flash"
}
```

The backend should use this model parameter to route to the correct AI service.

## ✨ Gemini 2.5 Flash Benefits

### Why This Model?

1. **⚡ Fast Response Times**
   - Optimized for speed
   - Low latency for real-time chat
   - Efficient token usage

2. **💰 Cost-Effective**
   - Lower cost per request
   - Good quality-to-price ratio
   - Suitable for high-volume usage

3. **🎯 Accurate**
   - High-quality responses
   - Good at following instructions
   - Excellent document comprehension

4. **📚 RAG-Friendly**
   - Works well with context injection
   - Handles long documents
   - Good citation capabilities

## 🔐 API Keys

Make sure your backend has the necessary API keys:

```bash
# Backend .env file
GOOGLE_API_KEY=your_google_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## 🎛️ Model Parameters

Recommended settings for Gemini 2.5 Flash in RAG:

```python
generation_config = {
    "temperature": 0.7,        # Balanced creativity
    "top_p": 0.9,              # Nucleus sampling
    "top_k": 40,               # Top-k sampling
    "max_output_tokens": 2048, # Response length
}
```

## 📈 Performance Metrics

Expected performance with Gemini 2.5 Flash:

- **Response Time**: 1-3 seconds
- **Accuracy**: ~85-90% with good RAG context
- **Token Limit**: Up to 32k input tokens
- **Output**: Up to 8k output tokens

## 🔄 Model Fallback

You can implement fallback logic in the backend:

```python
def get_ai_response(message, context, model="gemini-2.5-flash"):
    try:
        if model == "gemini-2.5-flash":
            return gemini_flash_response(message, context)
        elif model == "gemini-1.5-pro":
            return gemini_pro_response(message, context)
        else:
            # Default fallback
            return gemini_flash_response(message, context)
    except Exception as e:
        # Fallback to alternative model
        logger.error(f"Model {model} failed: {e}")
        return fallback_model_response(message, context)
```

## 📚 Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Gemini Models**: https://ai.google.dev/models/gemini
- **Pricing**: https://ai.google.dev/pricing
- **Best Practices**: https://ai.google.dev/docs/best_practices

## ✅ Checklist

Before deploying with Gemini 2.5 Flash:

- [ ] Google API key configured in backend
- [ ] Model specified in `.env` file
- [ ] Backend supports `model` parameter in `/chat` endpoint
- [ ] Rate limiting configured
- [ ] Error handling for API failures
- [ ] Cost monitoring enabled
- [ ] Response quality tested

## 🆘 Troubleshooting

### Issue: "Model not found"

**Solution**: Check that your backend has access to Gemini 2.5 Flash API

### Issue: Slow responses

**Solution**: 
- Check API quota limits
- Verify network latency
- Consider caching common queries

### Issue: Poor quality responses

**Solution**:
- Improve RAG context quality
- Adjust temperature parameter
- Provide better document chunks
- Fine-tune prompt engineering

## 🎯 Production Deployment

For production with Gemini 2.5 Flash:

1. **Set Environment Variables**
   ```bash
   VITE_API_BASE_URL=https://your-api.com
   VITE_AI_MODEL=gemini-2.5-flash
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Deploy**
   - Frontend: Netlify/Vercel
   - Backend: Configure with Google Cloud credentials

4. **Monitor**
   - Track API usage
   - Monitor response times
   - Check error rates

---

**🚀 Your frontend is now configured to use Gemini 2.5 Flash for intelligent, fast responses!**

