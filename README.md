# Type Alpha

> 60 Seconds of Pure Focus - A competitive typing tool

🎮 **Play Now**: https://kobay.github.io/TypeAlpha/

![Type Alpha Screenshot](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## Features

- ⏱️ **60-second typing challenge** - Test your speed and accuracy
- 📅 **Daily Mode** - Same challenge for everyone, compete globally
- 🔄 **Practice Mode** - Random seeds for unlimited practice
- 📊 **Detailed Statistics** - WPM, accuracy, and weak key analysis
- 🏆 **Rank System** - S, A, B, C, D ranks based on WPM
- 📈 **Progress Tracking** - Local history and growth visualization
- 🐦 **Social Sharing** - Share your results on Twitter
- ⌨️ **Keyboard-first** - Full keyboard navigation support
- 🌐 **Zero-cost hosting** - No database required, all data in LocalStorage

## How to Play

1. Choose **Daily** (same seed for everyone today) or **Practice** (random seed)
2. Wait for the 3-second countdown
3. Type the characters as they appear
4. **No backspace** - mistakes count, keep going!
5. View your results and compete for the best rank

### Keyboard Shortcuts

| Screen | Key | Action |
|--------|-----|--------|
| Top | `D` | Start Daily |
| Top | `P` | Start Practice |
| Top | `H` | View History |
| Game | `Esc` | Quit |
| Result | `R` | Retry |
| Result | `S` | Share |
| Result | `C` | Copy |
| Result | `H` | Home |
| Result | `Tab` | History |

## Rank System

| Rank | WPM Required |
|------|-------------|
| S | 120+ |
| A | 90+ |
| B | 60+ |
| C | 40+ |
| D | Below 40 |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Vite** - Build tool
- **TypeScript** - Type-safe JavaScript
- **Vanilla CSS** - No framework, pure CSS with custom properties
- **LocalStorage** - Data persistence
- **GitHub Pages** - Hosting

## Configuration

Edit `public/config.json` to customize:

- Game duration
- Letter frequency weights
- Same-finger penalty
- Pattern insertion rate
- Rank thresholds
- UI settings

See [docs/CONFIG.md](docs/CONFIG.md) for detailed documentation.

## License

MIT
