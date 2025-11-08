# Usage Guide

## Getting Started

### 1. Initial Setup

Before running the AI App Publisher, ensure you have:

1. **API Keys configured** in `.env`:
   ```bash
   OPENAI_API_KEY=sk-...
   REPLICATE_API_TOKEN=r8_...
   ```

2. **Dependencies installed**:
   ```bash
   npm install
   ```

3. **Project built**:
   ```bash
   npm run build
   ```

### 2. Running the Publisher

Start the CLI:

```bash
npm run dev
# or
npm start
```

## Workflow Steps

### Step 1: Project Selection

The system will prompt you for your project path:

```
Enter the path to your React Native/Expo project: /path/to/your/app
```

The scanner will detect:
- Project type (Expo or React Native)
- App name and version
- Existing assets
- Installed features

### Step 2: Branding

Choose one of:
- **Use existing branding** - Keep current icons and splash
- **Generate new branding** - AI creates new assets
- **Skip branding** - Proceed without branding changes

If generating new branding, the AI will create:
- App icon (1024x1024)
- Splash screen (2048x2048)
- Color palette
- Multiple icon sizes

### Step 3: Metadata Generation

The AI will generate:
- Optimized app name
- Short description (tagline)
- Long description (App Store/Play Store)
- Keywords for ASO
- Category suggestion
- Promotional text

You can review and edit all generated text before proceeding.

### Step 4: Screenshots

Options:
- **Capture from simulator** - Automatically capture from running app
- **Use existing** - Skip if you already have screenshots
- **Skip** - Add screenshots manually later

#### For Automatic Capture:

**iOS**:
1. Start your app: `npx expo start --ios`
2. Wait for app to load in simulator
3. Let the tool capture screenshots

**Android**:
1. Start your app: `npx expo start --android`
2. Wait for app to load in emulator
3. Let the tool capture screenshots

### Step 5: Optimization

The system will automatically:
- Generate icon sizes (48px to 1024px)
- Optimize screenshots for stores
- Compress images
- Validate dimensions

### Step 6: Export

All assets are exported to `export/your-app-name/`:

```
export/your-app-name/
├── README.md                    # Instructions
├── metadata.json               # Complete metadata
├── store/
│   ├── appstore/
│   │   └── description.txt
│   ├── playstore/
│   │   └── description.txt
│   └── keywords.txt
└── assets/
    ├── icons/
    ├── splash/
    └── screenshots/
```

## Advanced Usage

### Custom Configuration

Create `config.json`:

```json
{
  "openai_api_key": "sk-...",
  "replicate_api_key": "r8_...",
  "output_dir": "my-exports",
  "default_language": "es",
  "image_size": 2048,
  "auto_launch_simulator": false,
  "ios_device": "iPhone 15 Pro Max",
  "android_device": "Pixel_8_Pro"
}
```

### Environment Variables

All config options can be set via environment variables:

```bash
export OPENAI_API_KEY=sk-...
export OUTPUT_DIR=exports
export DEFAULT_LANGUAGE=en
export IMAGE_SIZE=1024
```

### Manual Screenshot Capture

If automatic capture doesn't work:

**iOS Simulator**:
1. Open your app in simulator
2. Press `Cmd + S` to save screenshot
3. Save to `export/your-app/assets/screenshots/ios/`

**Android Emulator**:
1. Open your app in emulator
2. Click camera icon in toolbar
3. Save to `export/your-app/assets/screenshots/android/`

### Editing Generated Content

After generation, you can:

1. **Edit metadata** directly in the CLI
2. **Modify files** in the export directory
3. **Re-run** specific steps without starting over

### Publishing to Stores

#### App Store (iOS)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Upload icon: `assets/icons/icon_1024.png`
4. Upload screenshots from `assets/screenshots/ios/`
5. Copy description from `store/appstore/description.txt`
6. Add keywords from `store/keywords.txt`
7. Submit for review

#### Play Store (Android)

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload icon: `assets/icons/icon_512.png`
4. Upload screenshots from `assets/screenshots/android/`
5. Copy description from `store/playstore/description.txt`
6. Set category from metadata
7. Publish

## Tips & Best Practices

### Branding
- Review AI-generated icons before using
- Ensure icons work well at small sizes
- Test on both light and dark backgrounds
- Keep designs simple and recognizable

### Metadata
- Review and customize AI-generated text
- Add your unique value propositions
- Ensure keywords are relevant
- Keep descriptions clear and compelling

### Screenshots
- Capture 4-6 key screens
- Show main features
- Use high-resolution images
- Consider adding device frames

### Optimization
- Validate all images meet store requirements
- Check file sizes (< 10MB)
- Ensure correct dimensions
- Test on actual devices

## Troubleshooting

### API Errors

**"OpenAI API key not found"**
- Ensure `.env` file exists and contains `OPENAI_API_KEY`
- Check API key is valid and has credits

**"Image generation failed"**
- Check internet connection
- Verify Replicate or OpenAI API access
- Review API quotas and limits

### Simulator Issues

**"No simulator running"**
- Start simulator manually first
- For iOS: `open -a Simulator`
- For Android: `emulator -avd <device_name>`

**"Screenshot capture failed"**
- Ensure simulator is in foreground
- Check command-line tools installed
- Use manual screenshot capture as fallback

### Export Issues

**"Permission denied"**
- Check write permissions on output directory
- Run with appropriate permissions

**"Missing assets"**
- Review each step's output
- Check for error messages
- Some assets may be optional

## Examples

### Example 1: Expo Project

```bash
$ npm run dev

📱 AI App Publisher System

Enter path: /Users/john/Projects/MyExpoApp
✓ Project scanned (type: expo)
✓ Using existing branding
✓ Metadata generated
✓ 3 screenshots captured
✓ Images optimized
✓ Export complete: export/myexpoapp/
```

### Example 2: React Native Project

```bash
$ npm run dev

📱 AI App Publisher System

Enter path: /Users/jane/Projects/MyRNApp
✓ Project scanned (type: react-native)
✓ Branding generated with AI
✓ Metadata generated
✓ Screenshots skipped
✓ Images optimized
✓ Export complete: export/myrnapp/
```

## Next Steps

After exporting:

1. Review all generated content
2. Customize as needed
3. Add additional screenshots
4. Test on devices
5. Submit to stores!

## Support

For issues:
- Check the [FAQ](FAQ.md)
- Review error messages
- Open an issue on GitHub
- Check API service status
