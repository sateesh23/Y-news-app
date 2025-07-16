# Y - Multi-Theme News Reader

A modern, offline-capable news reader built with React Native and Expo, featuring multiple themes, font scaling, and smooth animations.

## 🚀 Features

### Core Features
- **Multi-Theme Support**: Light, Dark, AMOLED, and System themes
- **Offline Reading**: Save articles with images for offline access
- **Font Scaling**: 3-level font size adjustment with live preview
- **Smooth Animations**: Parallax hero images, scroll-tied header fade, haptic feedback
- **Search & Filter**: Full-text search with category filtering
- **Modern UI**: Clean design with 16px border radius and Inter font family

### Technical Features
- **React Navigation 7**: Bottom tabs + stack navigation
- **React Context**: State management with custom hooks
- **Reanimated 3**: High-performance animations
- **AsyncStorage**: Persistent data storage
- **NetInfo**: Network connectivity monitoring
- **Expo APIs**: Haptics, notifications, file system, sharing

## 📱 Screenshots

![Home Feed](<Screenshot 2025-07-16 at 9.50.42 AM.png>) ![Home Feed](<Screenshot 2025-07-16 at 9.51.11 AM.png>) ![Saved](<Screenshot 2025-07-16 at 9.51.28 AM.png>) ![Settings](<Screenshot 2025-07-16 at 9.51.40 AM.png>)

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd Y
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## 📁 Project Structure

```
Y/
├── src/
│   ├── assets/          # Mock JSON data, images
│   ├── components/      # Reusable UI components
│   │   ├── NewsCard.js
│   │   ├── EmptyState.js
│   │   └── OfflineBanner.js
│   ├── features/        # Feature-based modules
│   │   ├── feed/        # Home feed and search
│   │   ├── article/     # Article detail view
│   │   ├── offline/     # Saved articles
│   │   └── settings/    # App settings
│   ├── hooks/           # Custom React hooks
│   │   ├── useTheme.js
│   │   ├── useArticles.js
│   │   └── useOffline.js
│   ├── theme/           # Theme definitions
│   │   ├── light.js
│   │   ├── dark.js
│   │   ├── amoled.js
│   │   └── index.js
│   └── navigation/      # Navigation configuration
├── App.js               # Root component
├── package.json
└── README.md
```

## 🎨 Design System

### Color Palette
- **Light Theme**: White background, dark text, gradient accent
- **Dark Theme**: Dark gray background, light text
- **AMOLED Theme**: Pure black background for OLED displays

### Typography
- **Font Family**: Inter (Bold, SemiBold, Regular)
- **Sizes**: Headline (24px), Title (18px), Body (16px), Caption (14px), Small (12px)
- **Scaling**: 3 levels with 0.875x, 1x, 1.125x multipliers

### Spacing & Layout
- **Spacing Scale**: 4, 8, 16, 24, 32, 48px
- **Border Radius**: 16px consistently
- **Card Elevation**: 4px shadow/elevation

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Structure
- Unit tests for hooks and utilities
- Component tests with React Native Testing Library
- Integration tests for key user flows

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Git Hooks
- Pre-commit: Runs linting and formatting
- Pre-push: Runs tests

## 📦 Building & Deployment

### Development Build
```bash
# Create development build
eas build --profile development

# Install on device
eas build --profile development --platform ios --local
```

### Production Build
```bash
# Create production build
eas build --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 🚀 Performance Optimizations

- **FlatList Optimization**: `removeClippedSubviews`, `maxToRenderPerBatch`
- **Image Caching**: Efficient hero image loading and caching
- **Bundle Size**: Tree shaking and code splitting
- **Memory Management**: Proper cleanup of listeners and timers
- **60 FPS Animations**: Using `react-native-reanimated` on UI thread

## 📊 Bundle Size Analysis

Target bundle sizes:
- **Android AAB**: ≤ 25 MB
- **iOS IPA**: ≤ 30 MB

## ♿ Accessibility

- **WCAG 2.1 AA Compliance**: Color contrast ≥ 4.5:1
- **Screen Reader Support**: Proper accessibility labels
- **Dynamic Type**: Respects system font size settings
- **Touch Targets**: Minimum 44x44pt tap areas

## 🔒 Privacy & Security

- **No PII Collection**: All data stored locally
- **Local Storage Only**: No external data transmission
- **Secure Storage**: Using encrypted AsyncStorage where needed

## 🐛 Known Issues & Limitations

- Hero images require internet connection for initial download
- Search is client-side only (no server-side search)
- Limited to mock data (no real news API integration)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For the excellent libraries
- **Unsplash**: For the beautiful stock images used in mock data
- **Inter Font**: For the clean, readable typography

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using React Native & Expo**
