// AI Agent Service for intelligent conversation analysis and suggestions
// This replaces the hardcoded keyword matching with contextual AI responses

console.log('Loading AI Agent Service...');

class AIAgentService {
  constructor() {
    this.apiKey = null; // Will be set from settings
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.conversationContext = [];
    this.cache = new Map(); // Cache for API responses
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Set API key from settings
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // Add message to conversation context
  addToContext(message, sender, timestamp) {
    this.conversationContext.push({
      message,
      sender,
      timestamp,
      role: sender === 'user' ? 'user' : 'assistant'
    });
    
    // Keep only last 20 messages for context
    if (this.conversationContext.length > 20) {
      this.conversationContext = this.conversationContext.slice(-20);
    }
  }

  // Get conversation context as formatted string
  getContextString() {
    return this.conversationContext
      .map(msg => `${msg.sender}: ${msg.message}`)
      .join('\n');
  }

  // Analyze conversation and get intelligent suggestions
  async analyzeConversation(userMessage, channelInfo = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check cache first
    const cacheKey = `analyze_${userMessage.toLowerCase().trim()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('Using cached analysis result');
      return cached.data;
    }

    const systemPrompt = `You are a management assistant that helps managers communicate effectively in Slack. 

Your role is to:
1. Analyze conversation context and tone
2. Provide specific, actionable suggestions
3. Help de-escalate tense situations
4. Suggest improvements for clarity and effectiveness
5. Identify opportunities for positive reinforcement

Channel context: ${channelInfo.name || 'Unknown'} (${channelInfo.type || 'Unknown type'})

Respond with ONLY a valid JSON object containing:
{
  "tone_analysis": {
    "overall_sentiment": "positive|neutral|negative|tense",
    "urgency_level": "low|medium|high",
    "formality_level": "casual|professional|formal"
  },
  "suggestions": [
    {
      "type": "de_escalation|clarity|celebration|timeframe|collaboration",
      "priority": "high|medium|low",
      "message": "Human-readable suggestion",
      "reasoning": "Why this suggestion is relevant"
    }
  ],
  "boosted_message": "Improved version of the user's message (if applicable)",
  "immediate_action": "What the manager should do right now"
}

Do not include any other text, only the JSON object.`;

    const userPrompt = `Conversation context:
${this.getContextString()}

User's current message: "${userMessage}"

Please analyze this conversation and provide management insights.`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const result = JSON.parse(content);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.getFallbackResponse(userMessage);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  // Get tone score for a specific message
  async getToneScore(message) {
    if (!this.apiKey) {
      return { score: 50, description: 'API not configured' };
    }

    const systemPrompt = `Analyze the tone of this message and return ONLY a valid JSON object with this exact format:
{
  "score": 85,
  "description": "Professional and clear",
  "improvements": ["Could be more collaborative"]
}

Do not include any other text, only the JSON object.`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze this message: "${message}"` }
          ],
          temperature: 0.1,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        // Clean the content to ensure it's valid JSON
        const cleanContent = content.trim();
        const parsed = JSON.parse(cleanContent);
        
        // Validate the response has required fields
        if (typeof parsed.score === 'number' && typeof parsed.description === 'string') {
          return parsed;
        } else {
          console.warn('Invalid tone analysis response structure:', parsed);
          return { score: 50, description: 'Neutral tone' };
        }
      } catch (parseError) {
        console.error('Failed to parse tone analysis response:', parseError);
        console.error('Raw response:', content);
        return { score: 50, description: 'Neutral tone' };
      }
    } catch (error) {
      console.error('Tone analysis failed:', error);
      return { score: 50, description: 'Neutral tone' };
    }
  }

  // Boost a message using AI
  async boostMessage(message) {
    if (!this.apiKey) {
      return { original: message, boosted: message, score: 50 };
    }

    const systemPrompt = `You are a communication expert. Improve this message for clarity, tone, and effectiveness while maintaining the original intent. Return only the improved message, nothing else.`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Improve this message: "${message}"` }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const boostedMessage = data.choices[0].message.content.trim();
      
      // Get tone score for comparison
      const originalScore = await this.getToneScore(message);
      const boostedScore = await this.getToneScore(boostedMessage);

      return {
        original: message,
        boosted: boostedMessage,
        originalScore: originalScore.score,
        boostedScore: boostedScore.score,
        improvement: boostedScore.score - originalScore.score
      };
    } catch (error) {
      console.error('Message boost failed:', error);
      return { original: message, boosted: message, score: 50 };
    }
  }

  // Fallback response when AI is unavailable
  getFallbackResponse(message) {
    return {
      tone_analysis: {
        overall_sentiment: 'neutral',
        urgency_level: 'low',
        formality_level: 'professional'
      },
      suggestions: [
        {
          type: 'clarity',
          priority: 'medium',
          message: 'Consider adding more context to your message',
          reasoning: 'This helps ensure your team understands your intent'
        }
      ],
      boosted_message: message,
      immediate_action: 'Review your message before sending'
    };
  }

  // Clear conversation context
  clearContext() {
    this.conversationContext = [];
  }
}

// Export for use in content script
window.AIAgentService = AIAgentService;
console.log('AI Agent Service loaded successfully');
