import type { Screen, ScreenContext } from './index';
import { dateToSeed, randomSeed } from '../engine/seededRandom';
import { getDailyHighScore, getPracticeHighScore, getTodayDailyRecord } from '../storage/localStorage';

/**
 * Top画面
 * モード選択、ハイスコア表示、履歴への導線
 */
export class TopScreen implements Screen {
  private context: ScreenContext;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(context: ScreenContext) {
    this.context = context;
  }

  render(container: HTMLElement): void {
    const dailyHighScore = getDailyHighScore();
    const practiceHighScore = getPracticeHighScore();
    const todayRecord = getTodayDailyRecord();

    container.innerHTML = `
      <div class="top-screen">
        <header class="top-header">
          <h1 class="logo">Type<span class="logo-accent">Alpha</span></h1>
          <p class="tagline">60 Seconds of Pure Focus</p>
        </header>

        <main class="top-main">
          <div class="mode-buttons">
            <button class="mode-btn daily-btn" data-mode="daily">
              <span class="mode-icon">📅</span>
              <span class="mode-name">Daily</span>
              <span class="mode-desc">Today's Challenge</span>
              <span class="mode-key">Press D</span>
              ${todayRecord ? `<span class="today-score">Today: ${Math.round(todayRecord.wpm)} WPM</span>` : ''}
            </button>
            
            <button class="mode-btn practice-btn" data-mode="practice">
              <span class="mode-icon">🔄</span>
              <span class="mode-name">Practice</span>
              <span class="mode-desc">Random Practice</span>
              <span class="mode-key">Press P</span>
            </button>
          </div>

          <div class="high-scores">
            <h2>High Scores</h2>
            <div class="score-cards">
              <div class="score-card">
                <span class="score-label">Daily Best</span>
                <span class="score-value">${dailyHighScore ? Math.round(dailyHighScore.wpm) : '---'}</span>
                <span class="score-unit">WPM</span>
              </div>
              <div class="score-card">
                <span class="score-label">Practice Best</span>
                <span class="score-value">${practiceHighScore ? Math.round(practiceHighScore.wpm) : '---'}</span>
                <span class="score-unit">WPM</span>
              </div>
            </div>
          </div>

          <div class="keyboard-hints">
            <span class="hint-item"><kbd>D</kbd> Daily</span>
            <span class="hint-item"><kbd>P</kbd> Practice</span>
            <span class="hint-item"><kbd>H</kbd> History</span>
          </div>
        </main>

        <footer class="top-footer">
          <button class="nav-btn history-btn">📊 History</button>
        </footer>
      </div>
    `;

    this.attachEventListeners(container);
  }

  private attachEventListeners(container: HTMLElement): void {
    // Dailyボタン
    const dailyBtn = container.querySelector('[data-mode="daily"]');
    dailyBtn?.addEventListener('click', () => {
      this.startDaily();
    });

    // Practiceボタン
    const practiceBtn = container.querySelector('[data-mode="practice"]');
    practiceBtn?.addEventListener('click', () => {
      this.startPractice();
    });

    // 履歴ボタン
    const historyBtn = container.querySelector('.history-btn');
    historyBtn?.addEventListener('click', () => {
      this.context.navigateTo('history');
    });

    // キーボードショートカット
    this.keyHandler = (e: KeyboardEvent) => {
      // 入力欄にフォーカスがある場合は無視
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'd':
          e.preventDefault();
          this.startDaily();
          break;
        case 'p':
          e.preventDefault();
          this.startPractice();
          break;
        case 'h':
          e.preventDefault();
          this.context.navigateTo('history');
          break;
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  private startDaily(): void {
    const seed = dateToSeed();
    this.context.navigateTo('game', { mode: 'daily', seed });
  }

  private startPractice(): void {
    const seed = randomSeed();
    this.context.navigateTo('game', { mode: 'practice', seed });
  }

  cleanup(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }
}
