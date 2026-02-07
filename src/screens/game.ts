import type { Screen, ScreenContext, ScreenData } from './index';
import type { KeyStroke, GameMode, GameResult, Config } from '../types';
import { CharacterGenerator } from '../engine/generator';

interface GameData {
  mode: GameMode;
  seed: number;
}

/**
 * Game画面
 * 60秒間のタイピングセッション
 */
export class GameScreen implements Screen {
  private context: ScreenContext;
  private config: Config;
  
  // ゲーム状態
  private generator: CharacterGenerator | null = null;
  private characters: string = '';
  private currentIndex: number = 0;
  private strokes: KeyStroke[] = [];
  private startTime: number = 0;
  private timeRemaining: number = 0;
  private isRunning: boolean = false;
  private isCountdown: boolean = false;
  private countdownValue: number = 0;
  
  // DOM要素
  private container: HTMLElement | null = null;
  private timerEl: HTMLElement | null = null;
  private wpmEl: HTMLElement | null = null;
  private accEl: HTMLElement | null = null;
  private trackEl: HTMLElement | null = null;
  
  // タイマー
  private gameTimer: number | null = null;
  private countdownTimer: number | null = null;
  
  // ゲームデータ
  private gameData: GameData | null = null;

  constructor(context: ScreenContext) {
    this.context = context;
    this.config = context.config;
  }

  render(container: HTMLElement, data?: ScreenData): void {
    this.container = container;
    this.gameData = data as GameData;
    
    if (!this.gameData) {
      this.context.navigateTo('top');
      return;
    }

    container.innerHTML = `
      <div class="game-screen">
        <header class="game-header">
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">TIME</span>
              <span class="stat-value" id="timer">${this.config.game.duration}</span>
            </div>
            <div class="stat">
              <span class="stat-label">WPM</span>
              <span class="stat-value" id="wpm">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">ACC</span>
              <span class="stat-value" id="acc">100%</span>
            </div>
          </div>
        </header>

        <main class="game-main">
          <div class="typing-area">
            <div class="track-container">
              <div class="track" id="track"></div>
              <div class="caret"></div>
            </div>
          </div>
          
          <div class="countdown-overlay" id="countdown">
            <span class="countdown-number">${this.config.game.countdownSeconds}</span>
          </div>
        </main>

        <footer class="game-footer">
          <span class="hint">Press Esc to quit</span>
        </footer>
      </div>
    `;

    // DOM要素を取得
    this.timerEl = container.querySelector('#timer');
    this.wpmEl = container.querySelector('#wpm');
    this.accEl = container.querySelector('#acc');
    this.trackEl = container.querySelector('#track');

    // ジェネレーターを初期化
    this.generator = new CharacterGenerator(this.gameData.seed, this.config);
    
    // 初期文字列を生成
    this.characters = this.generator.generate(200);
    this.currentIndex = 0;
    this.strokes = [];
    
    // トラックを描画
    this.renderTrack();
    
    // イベントリスナーを設定
    this.attachEventListeners();
    
    // カウントダウン開始
    this.startCountdown();
  }

  private startCountdown(): void {
    this.isCountdown = true;
    this.countdownValue = this.config.game.countdownSeconds;
    
    const countdownEl = this.container?.querySelector('#countdown');
    const numberEl = countdownEl?.querySelector('.countdown-number');
    
    if (!countdownEl || !numberEl) return;
    
    countdownEl.classList.add('active');
    
    this.countdownTimer = window.setInterval(() => {
      this.countdownValue--;
      
      if (this.countdownValue > 0) {
        numberEl.textContent = String(this.countdownValue);
        numberEl.classList.add('pulse');
        setTimeout(() => numberEl.classList.remove('pulse'), 200);
      } else {
        // カウントダウン終了
        if (this.countdownTimer) clearInterval(this.countdownTimer);
        countdownEl.classList.remove('active');
        countdownEl.classList.add('hidden');
        this.isCountdown = false;
        this.startGame();
      }
    }, 1000);
  }

  private startGame(): void {
    this.isRunning = true;
    this.startTime = Date.now();
    this.timeRemaining = this.config.game.duration;
    
    // ゲームタイマー開始
    this.gameTimer = window.setInterval(() => {
      this.timeRemaining--;
      this.updateTimer();
      
      if (this.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  private updateTimer(): void {
    if (this.timerEl) {
      this.timerEl.textContent = String(this.timeRemaining);
      
      // 残り10秒以下で警告表示
      if (this.timeRemaining <= 10) {
        this.timerEl.classList.add('warning');
      }
    }
  }

  private updateStats(): void {
    const elapsed = (Date.now() - this.startTime) / 1000 / 60; // 分
    const correctCount = this.strokes.filter(s => s.correct).length;
    const totalCount = this.strokes.length;
    
    // WPM計算 (1単語 = 5文字として計算)
    const wpm = elapsed > 0 ? (correctCount / 5) / elapsed : 0;
    
    // 正確性計算
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 100;
    
    if (this.wpmEl) {
      this.wpmEl.textContent = String(Math.round(wpm));
    }
    if (this.accEl) {
      this.accEl.textContent = `${accuracy.toFixed(0)}%`;
    }
  }

  private renderTrack(): void {
    if (!this.trackEl) return;
    
    const before = this.config.ui.visibleCharsBefore;
    const after = this.config.ui.visibleCharsAfter;
    
    // 表示範囲を計算
    const startIndex = Math.max(0, this.currentIndex - before);
    const endIndex = this.currentIndex + after;
    
    // 文字が足りなければ追加生成
    while (this.characters.length < endIndex + 50) {
      this.characters += this.generator!.generate(100);
    }
    
    // HTML生成
    let html = '';
    for (let i = startIndex; i < endIndex; i++) {
      const char = this.characters[i] || '';
      let className = 'char';
      
      if (i < this.currentIndex) {
        // 入力済み
        const stroke = this.strokes[i - (this.currentIndex - this.strokes.length)];
        if (stroke) {
          className += stroke.correct ? ' correct' : ' incorrect';
        }
      } else if (i === this.currentIndex) {
        // 現在位置
        className += ' current';
      } else {
        // 未入力
        className += ' pending';
      }
      
      html += `<span class="${className}" data-index="${i}">${char}</span>`;
    }
    
    this.trackEl.innerHTML = html;
    
    // スライド位置を調整
    const currentCharEl = this.trackEl.querySelector('.current');
    if (currentCharEl) {
      const offset = (currentCharEl as HTMLElement).offsetLeft;
      const containerWidth = this.trackEl.parentElement?.clientWidth || 0;
      const translateX = containerWidth / 2 - offset;
      this.trackEl.style.transform = `translateX(${translateX}px)`;
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Escで中断
    if (e.key === 'Escape') {
      this.cleanup();
      this.context.navigateTo('top');
      return;
    }
    
    // カウントダウン中は入力を無視
    if (this.isCountdown || !this.isRunning) return;
    
    // 特殊キーは無視
    if (e.key.length !== 1) return;
    
    // 英小文字のみ受け付け
    const key = e.key.toLowerCase();
    if (!/^[a-z]$/.test(key)) return;
    
    e.preventDefault();
    
    const expected = this.characters[this.currentIndex];
    const correct = key === expected;
    
    // 打鍵記録
    this.strokes.push({
      key,
      expected,
      correct,
      timestamp: Date.now() - this.startTime,
    });
    
    // ミス時のシェイク
    if (!correct) {
      this.shakeTypingArea();
    }
    
    // 次の文字へ
    this.currentIndex++;
    
    // 表示更新
    this.renderTrack();
    this.updateStats();
  };

  private shakeTypingArea(): void {
    const typingArea = this.container?.querySelector('.typing-area');
    if (typingArea) {
      typingArea.classList.add('shake');
      setTimeout(() => {
        typingArea.classList.remove('shake');
      }, this.config.ui.shakeDuration);
    }
  }

  private attachEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private endGame(): void {
    this.isRunning = false;
    
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    // 結果を計算
    const correctCount = this.strokes.filter(s => s.correct).length;
    const missCount = this.strokes.filter(s => !s.correct).length;
    const totalCount = this.strokes.length;
    const elapsed = this.config.game.duration / 60; // 分
    const wpm = (correctCount / 5) / elapsed;
    const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    
    // キー別統計
    const keyStats: Record<string, { correct: number; miss: number }> = {};
    for (const stroke of this.strokes) {
      if (!keyStats[stroke.expected]) {
        keyStats[stroke.expected] = { correct: 0, miss: 0 };
      }
      if (stroke.correct) {
        keyStats[stroke.expected].correct++;
      } else {
        keyStats[stroke.expected].miss++;
      }
    }
    
    const result: GameResult = {
      mode: this.gameData!.mode,
      seed: this.gameData!.seed,
      wpm,
      accuracy,
      correctCount,
      missCount,
      keyStats,
      strokes: this.strokes,
    };
    
    this.cleanup();
    this.context.navigateTo('result', result);
  }

  cleanup(): void {
    this.removeEventListeners();
    
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    
    this.isRunning = false;
    this.isCountdown = false;
  }
}
