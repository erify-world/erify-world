---
sidebar_position: 2
---

# Getting Started with ERIVOX™

**Your journey to AI-powered voice and text assistance begins here**

This guide will help you integrate ERIVOX™ into your applications and start building amazing voice-powered experiences.

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ or Python 3.9+
- An ERIFY™ developer account
- Basic understanding of API integration

## 🔑 API Access

### 1. Get Your API Key

```bash
# Register for ERIFY™ developer access
curl -X POST https://api.erify.world/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@domain.com",
    "project": "your-project-name"
  }'
```

### 2. Install the SDK

Choose your preferred language:

**Node.js/TypeScript**
```bash
npm install @erify/erivox-sdk
```

**Python**
```bash
pip install erivox-python
```

## 🚀 Quick Start

### Basic Text Interaction

```typescript
import { ERIVOX } from '@erify/erivox-sdk';

const erivox = new ERIVOX({
  apiKey: process.env.ERIVOX_API_KEY,
  mode: 'text'
});

async function chatWithERIVOX() {
  const response = await erivox.chat({
    message: "Hello, ERIVOX! Tell me about ERIFY™ Technologies.",
    context: {
      user: "developer",
      intent: "information"
    }
  });
  
  console.log(response.text);
  // Output: "Welcome! ERIFY™ Technologies is building luxury AI platforms..."
}
```

### Voice Integration

```typescript
const erivox = new ERIVOX({
  apiKey: process.env.ERIVOX_API_KEY,
  mode: 'voice',
  voiceProfile: 'luxury-professional'
});

// Start voice session
await erivox.startVoiceSession({
  onListening: () => console.log('🎙️ Listening...'),
  onProcessing: () => console.log('🧠 Processing...'),
  onResponse: (text, audioUrl) => {
    console.log('💬 Response:', text);
    // Play audio response
    playAudio(audioUrl);
  }
});
```

## 🚀 Getting Started

Ready to integrate ERIVOX™ into your projects?

1. [Explore Voice Commands](./voice-commands) - Learn about supported voice interactions
2. [API Reference](./api-reference) - Dive deep into all available methods
3. [Integrations](./integrations) - Connect with popular platforms
4. [Examples Gallery](./examples) - See ERIVOX™ in action

## 💡 Need Help?

- 📚 [Documentation Hub](/)
- 💬 [Developer Community](https://github.com/erify-world/erivox/discussions)
- 🐛 [Report Issues](https://github.com/erify-world/erivox/issues)
- 📧 [Support](mailto:dev-support@erify.world)

---

🗣️ *Ready to give your applications a voice? ERIVOX™ makes it happen.*