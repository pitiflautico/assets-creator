# 📱 AI App Publisher System

An automated platform that prepares and publishes React Native and Expo apps to iOS and Android stores using artificial intelligence.

## 🎯 Overview

The AI App Publisher System is a local automation tool that generates all the visual, textual, and configuration elements needed to publish mobile apps. It uses AI services (OpenAI, Replicate) to create:

- **Branding Assets**: Logos, icons, splash screens, and color palettes
- **Store Metadata**: Optimized descriptions, keywords, and promotional text
- **Screenshots**: Automated capture and optimization from simulators
- **Export Package**: Ready-to-upload assets for App Store and Play Store

## ✨ Features

- 🔍 **Smart Project Detection** - Automatically detects Expo or React Native projects
- 🎨 **AI-Powered Branding** - Generates beautiful logos and icons using DALL-E or Replicate
- ✍️ **ASO-Optimized Text** - Creates compelling descriptions with GPT-4
- 📸 **Screenshot Automation** - Captures screens from iOS/Android simulators
- 🖼️ **Image Optimization** - Resizes and compresses assets with Sharp
- 📦 **Complete Export** - Organizes everything into a publish-ready structure
- 🎯 **Interactive CLI** - User-friendly command-line interface

## 🚀 Quick Start

### Prerequisites

- Node.js 16 or higher
- macOS (recommended for iOS simulator support)
- OpenAI API key and/or Replicate API token
- Expo CLI or React Native CLI (for your projects)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd assets-creator
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys:
```bash
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=your_key_here
# REPLICATE_API_TOKEN=your_token_here
```

4. Build the project:
```bash
npm run build
```

### Usage

Run the CLI tool:

```bash
npm run dev
# or after building:
npm start
```

Follow the interactive prompts to:
1. Select your React Native/Expo project
2. Generate or use existing branding
3. Create store metadata with AI
4. Capture screenshots
5. Export everything ready for publishing

## 📂 Project Structure

```
ai-publisher/
├── src/
│   ├── index.ts           # Main CLI interface
│   ├── scanner.ts         # Project detection
│   ├── branding.ts        # AI image generation
│   ├── metadata.ts        # AI text generation
│   ├── simulator.ts       # Screenshot capture
│   ├── optimizer.ts       # Image processing
│   ├── exporter.ts        # Asset organization
│   ├── config.ts          # Configuration management
│   ├── types.ts           # TypeScript definitions
│   └── utils.ts           # Utility functions
├── export/                # Generated assets (created at runtime)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

Create a `config.json` file or use environment variables:

```json
{
  "openai_api_key": "sk-...",
  "replicate_api_key": "r8_...",
  "output_dir": "export",
  "default_language": "en",
  "image_size": 1024,
  "auto_launch_simulator": true,
  "ios_device": "iPhone 15 Pro",
  "android_device": "Pixel_7_Pro"
}
```

## 📋 Export Structure

The system generates a complete export package:

```
export/your-app-name/
├── README.md                      # Publishing instructions
├── metadata.json                  # Complete metadata
├── store/
│   ├── appstore/
│   │   └── description.txt       # iOS description
│   ├── playstore/
│   │   └── description.txt       # Android description
│   ├── app_name.txt
│   ├── tagline.txt
│   ├── keywords.txt
│   └── promotional_text.txt
└── assets/
    ├── icons/
    │   ├── icon_1024.png         # App Store
    │   ├── icon_512.png          # Play Store
    │   └── icon_*.png            # Various sizes
    ├── splash/
    │   └── splash.png
    ├── screenshots/
    │   ├── ios/
    │   └── android/
    └── colors.json               # Color palette
```

## 🤖 AI Services

### OpenAI (GPT-4 & DALL-E)
- **Text Generation**: App names, descriptions, keywords
- **Image Generation**: Logos, icons, splash screens

### Replicate (SDXL/Flux)
- **Image Generation**: Alternative to DALL-E
- **Logo Generation**: Specialized logo models

## 📸 Screenshots

### Automatic Capture

The system attempts to capture screenshots from running simulators:

**iOS**:
```bash
xcrun simctl io booted screenshot output.png
```

**Android**:
```bash
adb exec-out screencap -p > output.png
```

### Manual Capture

If simulators aren't available, you can manually add screenshots to the export directory.

## 🎨 Image Optimization

All images are automatically:
- Resized to required dimensions
- Compressed for optimal file size
- Validated against store requirements
- Generated in multiple sizes

### Supported Sizes

**Icons**: 48px, 72px, 96px, 120px, 152px, 167px, 180px, 192px, 512px, 1024px

**Screenshots**:
- iOS: 1179x2556, 1290x2796, 2048x2732
- Android: 1080x2340, 1440x3120

## 🔮 Future Enhancements

- [ ] Automatic publishing with Fastlane/EAS
- [ ] App Store Connect API integration
- [ ] Google Play Developer API integration
- [ ] ASO analysis and scoring
- [ ] Video preview generation
- [ ] Landing page creation
- [ ] A/B testing for metadata
- [ ] Multi-language support
- [ ] Electron GUI interface

## 🛠️ Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Run Development
```bash
npm run dev
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for React Native and Expo developers**
