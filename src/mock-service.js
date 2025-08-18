// Mock service for mgmt-boost API simulation
// This simulates the backend service that would provide message boosting and tone analysis

class MockMgmtBoostService {
  constructor() {
    this.toneKeywords = {
      positive: [
        "great",
        "awesome",
        "excellent",
        "good",
        "nice",
        "thanks",
        "appreciate",
        "love",
        "excited",
        "happy",
      ],
      negative: [
        "bad",
        "terrible",
        "awful",
        "hate",
        "angry",
        "frustrated",
        "disappointed",
        "worried",
        "concerned",
        "upset",
      ],
      directive: [
        "must",
        "should",
        "need to",
        "have to",
        "required",
        "mandatory",
        "urgent",
        "immediately",
        "asap",
      ],
      collaborative: [
        "let's",
        "we could",
        "maybe we",
        "what if",
        "how about",
        "suggest",
        "propose",
        "consider",
      ],
      formal: [
        "therefore",
        "consequently",
        "furthermore",
        "moreover",
        "additionally",
        "in conclusion",
        "regarding",
      ],
      casual: [
        "hey",
        "hi",
        "cool",
        "awesome",
        "yeah",
        "sure",
        "no problem",
        "got it",
        "thanks",
      ],
    };
  }

  // Analyze tone and provide insights
  analyzeTone(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let scores = {
      positive: 0,
      negative: 0,
      directive: 0,
      collaborative: 0,
      formal: 0,
      casual: 0,
    };

    // Count tone keywords
    Object.keys(this.toneKeywords).forEach((tone) => {
      this.toneKeywords[tone].forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = (lowerText.match(regex) || []).length;
        scores[tone] += matches;
      });
    });

    // Calculate overall tone score (0-100, higher = more positive/constructive)
    const positiveScore = Math.min(
      100,
      (scores.positive - scores.negative + 10) * 10
    );
    const collaborativeScore = Math.min(
      100,
      (scores.collaborative - scores.directive + 5) * 10
    );
    const overallScore = Math.max(
      0,
      Math.min(100, (positiveScore + collaborativeScore) / 2)
    );

    // Determine primary tone
    const maxTone = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    return {
      score: Math.round(overallScore),
      primaryTone: maxTone,
      breakdown: scores,
      insights: this.generateInsights(scores, text.length),
    };
  }

  // Generate management insights based on tone analysis
  generateInsights(scores, textLength) {
    const insights = [];

    if (scores.directive > scores.collaborative) {
      insights.push({
        type: "warning",
        message: "Consider using more collaborative language",
        suggestion: 'Try "let\'s" instead of "you must"',
      });
    }

    if (scores.negative > scores.positive) {
      insights.push({
        type: "warning",
        message: "Message may come across as negative",
        suggestion: "Consider reframing with positive intent",
      });
    }

    if (textLength > 200) {
      insights.push({
        type: "info",
        message: "Message is quite long",
        suggestion: "Consider breaking into smaller, focused messages",
      });
    }

    if (scores.collaborative > 0 && scores.positive > 0) {
      insights.push({
        type: "success",
        message: "Great collaborative tone!",
        suggestion: "This message encourages team engagement",
      });
    }

    return insights;
  }

  // Boost message for clarity and tone
  boostMessage(originalText) {
    const analysis = this.analyzeTone(originalText);

    // Generate boosted version based on analysis
    let boostedText = originalText;

    // Apply tone improvements
    if (analysis.breakdown.directive > analysis.breakdown.collaborative) {
      boostedText = this.makeMoreCollaborative(boostedText);
    }

    if (analysis.breakdown.negative > analysis.breakdown.positive) {
      boostedText = this.makeMorePositive(boostedText);
    }

    // Add clarity improvements
    boostedText = this.improveClarity(boostedText);

    return {
      original: originalText,
      boosted: boostedText,
      analysis: analysis,
      improvements: this.getImprovements(originalText, boostedText),
    };
  }

  // Make message more collaborative
  makeMoreCollaborative(text) {
    return text
      .replace(/\b(you must|you need to|you should)\b/gi, "let's")
      .replace(/\b(do this|complete this)\b/gi, "work on this together")
      .replace(/\b(urgent|asap)\b/gi, "when you have a chance")
      .replace(/\b(required|mandatory)\b/gi, "would be helpful");
  }

  // Make message more positive
  makeMorePositive(text) {
    return text
      .replace(/\b(bad|terrible|awful)\b/gi, "challenging")
      .replace(/\b(hate|dislike)\b/gi, "would prefer to avoid")
      .replace(/\b(worried|concerned)\b/gi, "thinking about")
      .replace(/\b(angry|frustrated)\b/gi, "focused on improving");
  }

  // Improve clarity
  improveClarity(text) {
    return text
      .replace(/\b(thing|stuff)\b/gi, "this")
      .replace(/\b(kinda|sorta)\b/gi, "somewhat")
      .replace(/\b(etc|etc\.)\b/gi, "and more")
      .replace(/\b(imo|tbh)\b/gi, "I think");
  }

  // Get list of improvements made
  getImprovements(original, boosted) {
    const improvements = [];

    if (original !== boosted) {
      improvements.push("Enhanced tone for better team engagement");
      improvements.push("Improved clarity and professionalism");
      improvements.push("Made language more collaborative");
    }

    return improvements;
  }

  // Simulate API call with delay
  async boostMessageAsync(text) {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 400)
    );

    return this.boostMessage(text);
  }

  // Get tone score only (faster response)
  async getToneScoreAsync(text) {
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 200)
    );

    return this.analyzeTone(text);
  }
}

// Export for use in content script
window.MockMgmtBoostService = MockMgmtBoostService;
