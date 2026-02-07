import type { Screen, ScreenContext } from './index';
import { getAllRecords, getWeakKeys } from '../storage/localStorage';

/**
 * History画面
 * 過去データの可視化、成長グラフ、苦手キー分析
 */
export class HistoryScreen implements Screen {
  private context: ScreenContext;

  constructor(context: ScreenContext) {
    this.context = context;
  }

  render(container: HTMLElement): void {
    const records = getAllRecords();
    const weakKeys = getWeakKeys(5);
    
    // 最近10件
    const recentRecords = records.slice(-10).reverse();
    
    // 統計計算
    const dailyRecords = records.filter(r => r.mode === 'daily');
    const practiceRecords = records.filter(r => r.mode === 'practice');
    
    const avgWpm = records.length > 0 
      ? records.reduce((sum, r) => sum + r.wpm, 0) / records.length 
      : 0;
    
    const avgAcc = records.length > 0 
      ? records.reduce((sum, r) => sum + r.accuracy, 0) / records.length 
      : 0;

    // WPM推移データ（最新20件）
    const chartData = records.slice(-20);

    container.innerHTML = `
      <div class="history-screen">
        <header class="history-header">
          <button class="back-btn">← Back</button>
          <h1>History & Analysis</h1>
        </header>

        <main class="history-main">
          <section class="stats-overview">
            <h2>Statistics</h2>
            <div class="overview-cards">
              <div class="overview-card">
                <span class="card-value">${records.length}</span>
                <span class="card-label">Total Games</span>
              </div>
              <div class="overview-card">
                <span class="card-value">${dailyRecords.length}</span>
                <span class="card-label">Daily</span>
              </div>
              <div class="overview-card">
                <span class="card-value">${practiceRecords.length}</span>
                <span class="card-label">Practice</span>
              </div>
              <div class="overview-card">
                <span class="card-value">${Math.round(avgWpm)}</span>
                <span class="card-label">Avg WPM</span>
              </div>
              <div class="overview-card">
                <span class="card-value">${avgAcc.toFixed(1)}%</span>
                <span class="card-label">Avg ACC</span>
              </div>
            </div>
          </section>

          ${chartData.length > 0 ? `
          <section class="wpm-chart">
            <h2>WPM Progress</h2>
            <div class="chart-container">
              <div class="chart-bars">
                ${chartData.map((r) => {
                  const maxWpm = Math.max(...chartData.map(r => r.wpm), 100);
                  const height = (r.wpm / maxWpm) * 100;
                  const modeClass = r.mode === 'daily' ? 'daily' : 'practice';
                  return `
                    <div class="chart-bar ${modeClass}" 
                         style="height: ${height}%"
                         title="${r.mode}: ${Math.round(r.wpm)} WPM">
                      <span class="bar-label">${Math.round(r.wpm)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </section>
          ` : ''}

          ${weakKeys.length > 0 ? `
          <section class="weak-keys-analysis">
            <h2>Weak Keys Analysis</h2>
            <div class="weak-keys-list">
              ${weakKeys.map(k => `
                <div class="weak-key-item">
                  <span class="key-char">${k.key}</span>
                  <div class="key-bar-container">
                    <div class="key-bar" style="width: ${k.accuracy * 100}%"></div>
                  </div>
                  <span class="key-acc">${(k.accuracy * 100).toFixed(1)}%</span>
                  <span class="key-count">(${k.count} times)</span>
                </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <section class="recent-games">
            <h2>Recent Games</h2>
            ${recentRecords.length > 0 ? `
            <div class="games-list">
              ${recentRecords.map(r => {
                const date = new Date(r.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                return `
                  <div class="game-item ${r.mode}">
                    <span class="game-mode">${r.mode === 'daily' ? '📅' : '🔄'}</span>
                    <span class="game-date">${dateStr}</span>
                    <span class="game-wpm">${Math.round(r.wpm)} WPM</span>
                    <span class="game-acc">${r.accuracy.toFixed(1)}%</span>
                  </div>
                `;
              }).join('')}
            </div>
            ` : `
            <p class="no-data">No records yet</p>
            `}
          </section>
        </main>

        <footer class="history-footer">
          <button class="nav-btn home-btn">🏠 Home</button>
        </footer>
      </div>
    `;

    this.attachEventListeners(container);
  }

  private attachEventListeners(container: HTMLElement): void {
    // 戻るボタン
    const backBtn = container.querySelector('.back-btn');
    backBtn?.addEventListener('click', () => {
      this.context.navigateTo('top');
    });

    // トップへボタン
    const homeBtn = container.querySelector('.home-btn');
    homeBtn?.addEventListener('click', () => {
      this.context.navigateTo('top');
    });
  }

  cleanup(): void {
    // イベントリスナーはDOMと共に削除される
  }
}
