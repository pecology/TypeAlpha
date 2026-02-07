import type { Screen, ScreenContext, ScreenData } from './index';
import type { GameResult, Rank, Config } from '../types';
import { shareToTwitter, copyResultToClipboard } from '../utils/share';
import { saveRecord, generateId } from '../storage/localStorage';
import { dateToSeed, randomSeed } from '../engine/seededRandom';

/**
 * WPMからランクを計算
 */
function calculateRank(wpm: number, config: Config): Rank {
  const { ranking } = config;
  if (wpm >= ranking.S) return 'S';
  if (wpm >= ranking.A) return 'A';
  if (wpm >= ranking.B) return 'B';
  if (wpm >= ranking.C) return 'C';
  return 'D';
}

/**
 * ランクに応じた色を取得
 */
function getRankColor(rank: Rank): string {
  const colors: Record<Rank, string> = {
    S: '#ffd700', // Gold
    A: '#c0c0c0', // Silver  
    B: '#cd7f32', // Bronze
    C: '#6366f1', // Purple
    D: '#6b7280', // Gray
  };
  return colors[rank];
}

/**
 * Result画面
 * スコア表示、SNS共有、リトライ
 */
export class ResultScreen implements Screen {
  private context: ScreenContext;
  private result: GameResult | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(context: ScreenContext) {
    this.context = context;
  }

  render(container: HTMLElement, data?: ScreenData): void {
    this.result = data as GameResult;
    
    if (!this.result) {
      this.context.navigateTo('top');
      return;
    }

    // 記録を保存
    saveRecord({
      id: generateId(),
      mode: this.result.mode,
      seed: this.result.seed,
      date: new Date().toISOString(),
      wpm: this.result.wpm,
      accuracy: this.result.accuracy,
      correctCount: this.result.correctCount,
      missCount: this.result.missCount,
      keyStats: this.result.keyStats,
      strokes: this.result.strokes,
    });

    const modeLabel = this.result.mode === 'daily' ? 'Daily Challenge' : 'Practice';
    const totalChars = this.result.correctCount + this.result.missCount;
    
    // ランク計算
    const rank = calculateRank(this.result.wpm, this.context.config);
    const rankColor = getRankColor(rank);

    // 苦手キートップ3
    const weakKeys = Object.entries(this.result.keyStats)
      .filter(([, stats]) => stats.miss > 0)
      .map(([key, stats]) => ({
        key,
        accuracy: stats.correct / (stats.correct + stats.miss),
        misses: stats.miss,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    container.innerHTML = `
      <div class="result-screen">
        <header class="result-header">
          <span class="result-mode">${modeLabel}</span>
          <h1 class="result-title">Result</h1>
        </header>

        <main class="result-main">
          <div class="rank-display">
            <span class="rank-label">RANK</span>
            <span class="rank-letter" style="color: ${rankColor}; text-shadow: 0 0 30px ${rankColor};">${rank}</span>
          </div>

          <div class="score-display">
            <div class="main-score">
              <span class="score-number">${Math.round(this.result.wpm)}</span>
              <span class="score-label">WPM</span>
            </div>
            <div class="sub-scores">
              <div class="sub-score">
                <span class="sub-value">${this.result.accuracy.toFixed(1)}%</span>
                <span class="sub-label">Accuracy</span>
              </div>
              <div class="sub-score">
                <span class="sub-value">${this.result.correctCount}</span>
                <span class="sub-label">Correct</span>
              </div>
              <div class="sub-score">
                <span class="sub-value">${this.result.missCount}</span>
                <span class="sub-label">Miss</span>
              </div>
              <div class="sub-score">
                <span class="sub-value">${totalChars}</span>
                <span class="sub-label">Total</span>
              </div>
            </div>
          </div>

          ${weakKeys.length > 0 ? `
          <div class="weak-keys">
            <h3>Weak Keys</h3>
            <div class="weak-keys-list">
              ${weakKeys.map(k => `
                <div class="weak-key">
                  <span class="weak-key-char">${k.key}</span>
                  <span class="weak-key-stat">${(k.accuracy * 100).toFixed(0)}%</span>
                  <span class="weak-key-miss">${k.misses} miss</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="result-actions">
            <button class="action-btn primary retry-btn">
              🔄 Retry <kbd>R</kbd>
            </button>
            <button class="action-btn share-btn">
              🐦 Share <kbd>S</kbd>
            </button>
            <button class="action-btn copy-btn">
              📋 Copy <kbd>C</kbd>
            </button>
          </div>

          <div class="keyboard-hints">
            <span class="hint-item"><kbd>R</kbd> Retry</span>
            <span class="hint-item"><kbd>S</kbd> Share</span>
            <span class="hint-item"><kbd>C</kbd> Copy</span>
            <span class="hint-item"><kbd>H</kbd> Home</span>
            <span class="hint-item"><kbd>Tab</kbd> History</span>
          </div>
        </main>

        <footer class="result-footer">
          <button class="nav-btn home-btn">🏠 Home</button>
          <button class="nav-btn history-btn">📊 History</button>
        </footer>
      </div>
    `;

    this.attachEventListeners(container);
  }

  private attachEventListeners(container: HTMLElement): void {
    // キーボードショートカット
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          this.retry();
          break;
        case 's':
          e.preventDefault();
          if (this.result) shareToTwitter(this.result);
          break;
        case 'c':
          e.preventDefault();
          this.copyResult(container);
          break;
        case 'h':
          e.preventDefault();
          this.context.navigateTo('top');
          break;
        case 'tab':
          e.preventDefault();
          this.context.navigateTo('history');
          break;
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    // リトライボタン
    const retryBtn = container.querySelector('.retry-btn');
    retryBtn?.addEventListener('click', () => this.retry());

    // シェアボタン
    const shareBtn = container.querySelector('.share-btn');
    shareBtn?.addEventListener('click', () => {
      if (this.result) {
        shareToTwitter(this.result);
      }
    });

    // コピーボタン
    const copyBtn = container.querySelector('.copy-btn');
    copyBtn?.addEventListener('click', () => this.copyResult(container));

    // トップへボタン
    const homeBtn = container.querySelector('.home-btn');
    homeBtn?.addEventListener('click', () => {
      this.context.navigateTo('top');
    });

    // 履歴ボタン
    const historyBtn = container.querySelector('.history-btn');
    historyBtn?.addEventListener('click', () => {
      this.context.navigateTo('history');
    });
  }

  private retry(): void {
    if (!this.result) return;
    
    const seed = this.result.mode === 'daily' 
      ? dateToSeed() 
      : randomSeed();
    
    this.context.navigateTo('game', { mode: this.result.mode, seed });
  }

  private async copyResult(container: HTMLElement): Promise<void> {
    if (!this.result) return;
    
    const success = await copyResultToClipboard(this.result);
    if (success) {
      const copyBtn = container.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      }
    }
  }

  cleanup(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }
}
