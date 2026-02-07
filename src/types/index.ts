// ゲームモード
export type GameMode = 'daily' | 'practice';

// 画面状態
export type ScreenName = 'top' | 'game' | 'result' | 'history';

// 打鍵記録
export interface KeyStroke {
  key: string;           // 入力されたキー
  expected: string;      // 期待されたキー
  correct: boolean;      // 正誤
  timestamp: number;     // タイムスタンプ (ms)
}

// ゲーム記録
export interface GameRecord {
  id: string;
  mode: GameMode;
  seed: number;
  date: string;          // ISO形式
  wpm: number;
  accuracy: number;
  correctCount: number;
  missCount: number;
  keyStats: Record<string, { correct: number; miss: number }>;
  strokes: KeyStroke[];
}

// ゲーム結果（Result画面用）
export interface GameResult {
  mode: GameMode;
  seed: number;
  wpm: number;
  accuracy: number;
  correctCount: number;
  missCount: number;
  keyStats: Record<string, { correct: number; miss: number }>;
  strokes: KeyStroke[];
}

// 設定ファイルの型
export interface Config {
  game: {
    duration: number;
    countdownSeconds: number;
  };
  generator: {
    letterWeights: Record<string, number>;
    sameFingerPenalty: number;
    patternInsertRate: number;
    patterns: string[];
  };
  fingerMap: Record<string, number>;
  ui: {
    shakeIntensity: number;
    shakeDuration: number;
    slideTransitionMs: number;
    visibleCharsBefore: number;
    visibleCharsAfter: number;
  };
  ranking: {
    S: number;
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

// ランク
export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

// 画面遷移イベント
export interface ScreenTransition {
  to: ScreenName;
  data?: GameResult | { mode: GameMode; seed: number };
}
