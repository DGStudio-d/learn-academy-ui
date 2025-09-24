import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n';
import { describe, it, expect, beforeEach } from 'vitest';

// Simple component to test translations
const TestComponent = () => (
  <div>
    <h1 data-testid="welcome-text">{i18n.t('dashboard.welcomeDefault')}</h1>
    <p data-testid="continue-text">{i18n.t('dashboard.continueJourney')}</p>
    <button data-testid="quiz-button">{i18n.t('student.dashboard.takeQuiz')}</button>
    <span data-testid="lessons-text">{i18n.t('student.dashboard.lessonsCompleted', { completed: 5, total: 10 })}</span>
  </div>
);

describe('Translation Integration', () => {
  beforeEach(() => {
    // Reset to English for consistent testing
    i18n.changeLanguage('en');
  });

  it('loads English translations correctly', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    expect(screen.getByTestId('welcome-text')).toHaveTextContent('Welcome back!');
    expect(screen.getByTestId('continue-text')).toHaveTextContent('Continue your language learning journey');
    expect(screen.getByTestId('quiz-button')).toHaveTextContent('Take Quiz');
    expect(screen.getByTestId('lessons-text')).toHaveTextContent('5 of 10 lessons completed');
  });

  it('loads Arabic translations correctly', async () => {
    // Change to Arabic
    await i18n.changeLanguage('ar');
    
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    expect(screen.getByTestId('welcome-text')).toHaveTextContent('أهلاً بعودتك!');
    expect(screen.getByTestId('continue-text')).toHaveTextContent('تابع رحلة تعلم اللغة');
    expect(screen.getByTestId('quiz-button')).toHaveTextContent('خذ اختبار');
    expect(screen.getByTestId('lessons-text')).toHaveTextContent('5 من 10 دروس مكتملة');
  });

  it('loads Spanish translations correctly', async () => {
    // Change to Spanish
    await i18n.changeLanguage('es');
    
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    expect(screen.getByTestId('welcome-text')).toHaveTextContent('¡Bienvenido de nuevo!');
    expect(screen.getByTestId('continue-text')).toHaveTextContent('Continúa tu viaje de aprendizaje de idiomas');
    expect(screen.getByTestId('quiz-button')).toHaveTextContent('Tomar Quiz');
    expect(screen.getByTestId('lessons-text')).toHaveTextContent('5 de 10 lecciones completadas');
  });
});