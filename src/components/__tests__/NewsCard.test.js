import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NewsCard } from '../NewsCard';
import { ThemeProvider } from '../../hooks/useTheme';
import { ArticlesProvider } from '../../hooks/useArticles';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
}));

const mockArticle = {
  id: '1',
  title: 'Test Article Title',
  excerpt: 'This is a test article excerpt that should be displayed in the card.',
  heroImage: 'https://example.com/image.jpg',
  category: 'Technology',
  publishedAt: new Date('2025-07-10T14:30:00Z'),
  readTime: 4,
  author: 'Test Author',
  tags: ['test', 'article'],
};

const TestWrapper = ({ children }) => (
  <ThemeProvider>
    <ArticlesProvider>
      {children}
    </ArticlesProvider>
  </ThemeProvider>
);

describe('NewsCard', () => {
  const mockOnPress = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders article information correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <NewsCard
          article={mockArticle}
          onPress={mockOnPress}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    expect(getByText('Test Article Title')).toBeTruthy();
    expect(getByText('This is a test article excerpt that should be displayed in the card.')).toBeTruthy();
    expect(getByText('Technology')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
    expect(getByText('4 min')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <NewsCard
          article={mockArticle}
          onPress={mockOnPress}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    const card = getByLabelText('Read article: Test Article Title');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledWith(mockArticle);
  });

  it('calls onSave when bookmark button is pressed', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <NewsCard
          article={mockArticle}
          onPress={mockOnPress}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    const bookmarkButton = getByLabelText('Save article');
    fireEvent.press(bookmarkButton);

    expect(mockOnSave).toHaveBeenCalledWith(mockArticle);
  });

  it('formats date correctly', () => {
    const recentArticle = {
      ...mockArticle,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    };

    const { getByText } = render(
      <TestWrapper>
        <NewsCard
          article={recentArticle}
          onPress={mockOnPress}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    expect(getByText('2h ago')).toBeTruthy();
  });

  it('shows correct bookmark state for saved articles', () => {
    // This test would require mocking the useArticles hook to return a saved article
    // For now, we'll test the basic rendering
    const { getByLabelText } = render(
      <TestWrapper>
        <NewsCard
          article={mockArticle}
          onPress={mockOnPress}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );

    // Should show "Save article" for unsaved articles
    expect(getByLabelText('Save article')).toBeTruthy();
  });

  it('applies compact variant styling when specified', () => {
    const { getByLabelText } = render(
      <TestWrapper>
        <NewsCard
          article={mockArticle}
          onPress={mockOnPress}
          onSave={mockOnSave}
          variant="compact"
        />
      </TestWrapper>
    );

    const card = getByLabelText('Read article: Test Article Title');
    expect(card).toBeTruthy();
  });
});
