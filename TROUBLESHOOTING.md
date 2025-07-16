# Troubleshooting Guide

## ✅ Fixed: Reanimated Version Mismatch Error

### Problem
```
ERROR [runtime not ready]: ReanimatedError: [Reanimated] Mismatch between JavaScript part and native part of Reanimated (3.18.0 vs 3.17.4).
```

### Solution Applied
1. **Updated package versions** to match Expo SDK 53 requirements:
   ```bash
   npm install react-native-reanimated@~3.17.4 react-native-gesture-handler@~2.24.0 @react-native-async-storage/async-storage@2.1.2 react-native-safe-area-context@5.4.0 --legacy-peer-deps
   ```

2. **Added proper Babel configuration** in `babel.config.js`:
   ```javascript
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         'react-native-reanimated/plugin', // This must be last
       ],
     };
   };
   ```

3. **Cleared Metro cache** and restarted:
   ```bash
   npx expo start --clear
   ```

### Status: ✅ RESOLVED
The app now runs without version mismatch errors.

## Common Issues & Solutions

### 1. Metro Bundle Issues
**Problem**: Bundle fails to load or shows cache errors
**Solution**: 
```bash
npx expo start --clear
# or
rm -rf node_modules && npm install
```

### 2. iOS Simulator Not Opening
**Problem**: Pressing 'i' doesn't open iOS simulator
**Solution**:
- Ensure Xcode is installed
- Open Xcode and install iOS simulator
- Try: `npx expo run:ios`

### 3. Android Emulator Issues
**Problem**: Android emulator not detected
**Solution**:
- Ensure Android Studio is installed
- Start an AVD from Android Studio
- Try: `npx expo run:android`

### 4. Dependency Conflicts
**Problem**: npm install fails with peer dependency errors
**Solution**:
```bash
npm install --legacy-peer-deps
```

### 5. Reanimated Animations Not Working
**Problem**: Animations appear choppy or don't work
**Solution**:
- Ensure babel plugin is configured correctly
- Restart Metro bundler with `--clear` flag
- Check that reanimated version matches Expo SDK

## Performance Tips

### 1. Optimize FlatList Performance
- Use `removeClippedSubviews={true}`
- Set appropriate `maxToRenderPerBatch`
- Implement proper `keyExtractor`

### 2. Image Loading Optimization
- Use appropriate image sizes
- Implement lazy loading for hero images
- Cache images for offline use

### 3. Animation Performance
- Use `react-native-reanimated` for complex animations
- Avoid animating layout properties when possible
- Use `useNativeDriver: true` for basic animations

## Development Workflow

### 1. Starting Development
```bash
npm start                 # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
```

### 2. Testing
```bash
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run lint             # Check code quality
```

### 3. Building for Production
```bash
eas build --platform all --profile production
```

## Getting Help

1. **Check Expo Documentation**: https://docs.expo.dev/
2. **React Native Reanimated Docs**: https://docs.swmansion.com/react-native-reanimated/
3. **GitHub Issues**: Check the project repository for known issues
4. **Expo Discord**: Join the Expo community for real-time help

## Version Compatibility Matrix

| Package | Version | Expo SDK 53 |
|---------|---------|-------------|
| react-native-reanimated | ~3.17.4 | ✅ |
| react-native-gesture-handler | ~2.24.0 | ✅ |
| @react-native-async-storage/async-storage | 2.1.2 | ✅ |
| react-native-safe-area-context | 5.4.0 | ✅ |
| jest | ~29.7.0 | ✅ |

## Environment Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed globally
- [ ] iOS: Xcode with iOS Simulator
- [ ] Android: Android Studio with AVD
- [ ] Git configured
- [ ] Code editor with React Native extensions

---

**Last Updated**: July 11, 2025
**Status**: All major issues resolved ✅
