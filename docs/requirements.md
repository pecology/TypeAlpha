# Type Alpha - 要件定義書

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 名称 | Type Alpha |
| コンセプト | 60秒間の極限集中。無駄を削ぎ落とした「しゅっとした」競技型タイピングツール |
| プラットフォーム | Webブラウザ（Vite + TypeScript / Vercelデプロイ） |
| 運用方針 | 0コスト運用（DB不要、LocalStorageとURLシードのみで完結） |

---

## 2. システム構成

### 2.1 アーキテクチャ
- **Architecture**: SPA (Single Page Application)
- **State Management**: Vanilla TypeScript による画面遷移（Screenステート）管理
- **Rendering**: DOM操作。CSS Transition/Transform を活用したスムーズな移動

### 2.2 技術スタック
- Vite (ビルドツール)
- TypeScript (言語)
- CSS3 (スタイリング・アニメーション)
- LocalStorage (データ永続化)

---

## 3. ゲームエンジン仕様

### 3.1 文字生成エンジン (Smooth-Stream Generator)

「気持ちよさ」と「調整の容易さ」を両立した生成ロジック。

#### 入力文字
- 英小文字 (a-z) のみ

#### 生成アルゴリズム

| 機能 | 説明 |
|------|------|
| 重み付け | 各文字の出現頻度を設定可能（デフォルトは英文頻度） |
| 運指制約 | 同一指による連続打鍵（同指異キー）を制限するペナルティ係数を導入 |
| パターン挿入 | `ing`, `the` 等の打ちやすい塊を確率で混入 |
| 再現性 | シード値（seed）ベースの乱数生成 |

#### シード値の決定
- **Dailyモード**: 日付をシード（例: `20260207`）
- **Practiceモード**: ランダムな数値をシード

### 3.2 タイピング判定

#### 入力方式
- 1文字ずつ判定

#### 判定挙動（ノンストップ方式）
- **ノンストップ**: 正誤に関わらず、入力があった瞬間に次の文字へ進む
- **バックスペース**: 無効（戻ることはできない）

#### 統計記録
各打鍵について以下を記録：
- タイムスタンプ
- 正誤
- 対象キー

---

## 4. 画面構成とUI/UX

### 4.1 画面遷移図

```
┌─────────┐
│   Top   │ ← モード選択、ハイスコア、履歴導線
└────┬────┘
     │
     ▼
┌─────────┐
│  Game   │ ← 60秒タイピング、Escで中断
└────┬────┘
     │
     ▼
┌─────────┐
│ Result  │ ← スコア表示、SNS共有、リトライ
└────┬────┘
     │
     ▼
┌─────────┐
│ History │ ← 過去データ可視化、成長グラフ、苦手キー
└─────────┘
```

### 4.2 各画面の詳細

#### Top画面
- モード選択ボタン（Daily / Practice）
- ハイスコア表示
- 過去の履歴への導線

#### Game画面
- 60秒のタイピングセッション
- Escキーで中断可能
- 残り時間表示
- 現在のWPM/ACC表示

#### Result画面
- スコア表示（WPM, ACC）
- SNS共有ボタン
- リトライボタン
- 分析画面への遷移

#### History画面
- 過去データの可視化
- 成長グラフ
- 苦手キー分析

### 4.3 レイアウト（中央吸い込み型）

```
    ← スライド方向
    
[過去の文字][過去の文字][現在▎][未来の文字][未来の文字]
                          ↑
                     画面中央固定
```

- **メインレーン**: 画面中央に現在の入力位置（キャレット）を固定
- **スライド演出**: プレイヤーの入力速度に合わせ、文字列全体を `translateX` で左へスライド
- **視覚フィードバック**:
  - 通過した文字の色を確定（正解：白、ミス：赤）
  - ミス時は入力エリアを微振動（Shake）させる

---

## 5. 調整用パラメータ (Config)

`config.json` として分離管理：

```json
{
  "game": {
    "duration": 60,
    "countdownSeconds": 3
  },
  "generator": {
    "letterWeights": { ... },
    "sameFingerPenalty": 0.3,
    "patternInsertRate": 0.15,
    "patterns": ["ing", "the", "tion", "and", "ent", "ion"]
  },
  "ui": {
    "shakeIntensity": 5,
    "shakeDuration": 100,
    "slideTransitionMs": 50
  }
}
```

---

## 6. データ保存と外部連携

### 6.1 LocalStorage

```typescript
interface GameRecord {
  id: string;
  mode: 'daily' | 'practice';
  seed: number;
  date: string;
  wpm: number;
  accuracy: number;
  correctCount: number;
  missCount: number;
  keyStats: Record<string, { correct: number; miss: number }>;
}

// LocalStorage キー: "typealpha_scores"
// 値: GameRecord[]
```

### 6.2 SNS連携

Twitter共有URL形式：
```
https://twitter.com/intent/tweet?text=...
```

共有テキスト例：
```
【Type Alpha】
🎯 Daily Challenge
⌨️ WPM: 120
✅ ACC: 98.5%
#TypeAlpha
```

---

## 7. ファイル構成（予定）

```
TypeAlpha/
├── docs/
│   └── REQUIREMENTS.md
├── public/
│   └── config.json
├── src/
│   ├── main.ts
│   ├── styles/
│   │   └── main.css
│   ├── types/
│   │   └── index.ts
│   ├── engine/
│   │   ├── generator.ts      # 文字生成エンジン
│   │   └── seededRandom.ts   # シード付き乱数
│   ├── screens/
│   │   ├── index.ts          # 画面管理
│   │   ├── top.ts
│   │   ├── game.ts
│   │   ├── result.ts
│   │   └── history.ts
│   ├── storage/
│   │   └── localStorage.ts
│   └── utils/
│       └── share.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 8. 開発フェーズ

### Phase 1: 基盤構築
- [x] 要件定義書作成
- [ ] Vite + TypeScript プロジェクト初期化
- [ ] 設定ファイル(config.json)作成
- [ ] 型定義

### Phase 2: コア機能
- [ ] 文字生成エンジン実装
- [ ] 画面遷移管理実装
- [ ] タイピング判定ロジック

### Phase 3: UI実装
- [ ] Top画面
- [ ] Game画面
- [ ] Result画面
- [ ] History画面

### Phase 4: 仕上げ
- [ ] CSS/アニメーション
- [ ] LocalStorage保存
- [ ] SNS共有機能
- [ ] テスト・調整
