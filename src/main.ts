import './styles/main.css';
import type { Config } from './types';
import { ScreenManager } from './screens';
import { TopScreen } from './screens/top';
import { GameScreen } from './screens/game';
import { ResultScreen } from './screens/result';
import { HistoryScreen } from './screens/history';

/**
 * Type Alpha - 競技型タイピングツール
 * 60秒間の極限集中
 */
async function main() {
  // 設定ファイルを読み込み
  const config = await loadConfig();
  
  // アプリケーションコンテナを取得
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('App container not found');
    return;
  }
  
  // 画面マネージャーを初期化
  const screenManager = new ScreenManager(appContainer, config);
  const context = screenManager.getContext();
  
  // 各画面を登録
  screenManager.registerScreen('top', new TopScreen(context));
  screenManager.registerScreen('game', new GameScreen(context));
  screenManager.registerScreen('result', new ResultScreen(context));
  screenManager.registerScreen('history', new HistoryScreen(context));
  
  // 初期画面を表示
  screenManager.navigateTo('top');
  
  // グローバルキーボードショートカット
  document.addEventListener('keydown', (e) => {
    // デバッグ用: Ctrl+Shift+D で LocalStorage クリア
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      if (confirm('LocalStorageをクリアしますか？')) {
        localStorage.removeItem('typealpha_scores');
        location.reload();
      }
    }
  });
  
  console.log('Type Alpha initialized');
}

/**
 * 設定ファイルを読み込み
 */
async function loadConfig(): Promise<Config> {
  try {
    const response = await fetch('./config.json');
    if (!response.ok) {
      throw new Error('Failed to load config.json');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load config, using defaults:', error);
    return getDefaultConfig();
  }
}

/**
 * デフォルト設定
 */
function getDefaultConfig(): Config {
  return {
    game: {
      duration: 60,
      countdownSeconds: 3,
    },
    generator: {
      letterWeights: {
        a: 8.2, b: 1.5, c: 2.8, d: 4.3, e: 12.7, f: 2.2,
        g: 2.0, h: 6.1, i: 7.0, j: 0.15, k: 0.77, l: 4.0,
        m: 2.4, n: 6.7, o: 7.5, p: 1.9, q: 0.095, r: 6.0,
        s: 6.3, t: 9.1, u: 2.8, v: 0.98, w: 2.4, x: 0.15,
        y: 2.0, z: 0.074,
      },
      sameFingerPenalty: 0.3,
      patternInsertRate: 0.15,
      patterns: ['ing', 'the', 'tion', 'and', 'ent', 'ion', 'ere', 'her', 'ate', 'ter', 'hat', 'all', 'ith'],
    },
    fingerMap: {
      a: 0, q: 0, z: 0,
      s: 1, w: 1, x: 1,
      d: 2, e: 2, c: 2,
      f: 3, r: 3, v: 3, t: 3, g: 3, b: 3,
      j: 4, u: 4, m: 4, y: 4, h: 4, n: 4,
      k: 5, i: 5,
      l: 6, o: 6,
      p: 7,
    },
    ui: {
      shakeIntensity: 5,
      shakeDuration: 100,
      slideTransitionMs: 50,
      visibleCharsBefore: 40,
      visibleCharsAfter: 70,
    },
    ranking: {
      S: 120,
      A: 90,
      B: 60,
      C: 40,
      D: 0,
    },
  };
}

// DOMContentLoaded後に起動
document.addEventListener('DOMContentLoaded', main);
