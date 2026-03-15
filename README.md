# Axio: L-T-P-S Attendance Calculator

Axio is a premium, interactive web application designed for students to calculate and simulate their attendance with precision. It accounts for weighted class types and provides real-time feedback on academic requirements.

[Live Demo](https://axio-attendance-calculator.vercel.app/)

## 🚀 Key Features

- **Interactive Attendance Simulator**: Plan your remaining classes with real-time sliders and a dynamic bar chart.
- **Weighted Calculation**: Automatically handles complex class weights (Lecture: 1.0, Tutorial: 1.0, Practical: 0.5, Skill: 0.25).
- **Dark Mode Support**: Sleek, glassmorphic theme toggle for late-night study sessions.
- **Local Data Persistence**: Your attendance inputs and theme preferences are saved automatically across sessions.
- **Premium UI/UX**: Modern design with 3D hover effects, smooth transitions, and celebratory confetti burst upon reaching goals.
- **Social Integration**: Enhanced footer with LinkedIn, Instagram, and GitHub repository links.

## 🛠️ Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lazy0ne369/axio-attendance-calculator.git
   cd axio-attendance-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory (never commit it):
```env
VITE_WEB3FORMS_KEY=your-web3forms-access-key
```
Obtain a free key at: [web3forms.com](https://web3forms.com)

## 💻 Technical Stack

- **React 19**: Modern component-based architecture.
- **Vite**: Ultra-fast build tool and development server.
- **Glassmorphic CSS**: Advanced CSS variables and backdrop filters for a premium feel.
- **React Router**: Seamless Single Page Application (SPA) navigation.

## 📈 Usage

1. **Calculate**: Select your class types, enter your current attendance, and get your weighted percentage.
2. **Simulate**: Jump into the "Classes to Go" simulator. Drag sliders to plan your attendance for the rest of the term.
3. **Persist**: Refresh with confidence—your data is saved locally.
4. **Celebrate**: Hit your 85% goal and watch the confetti fly! 🎉

## 🚢 Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Add `VITE_WEB3FORMS_KEY` to the Environment Variables in Vercel settings.
3. Vercel will automatically detect Vite and deploy your application.

## 🤝 Contributing

Suggestions and bug reports are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
