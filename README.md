# Axio: L-T-P-S Attendance Calculator

Axio is a modern web application for calculating weighted attendance across different class types (Lecture, Tutorial, Practical, Skill) with precision and ease.

![Axio Logo](./public/favicon.svg)

## Features

- **Weighted Calculation**: Account for different class weights (L: 1.0, T: 1.0, P: 0.5, S: 0.25)
- **Flexible Selection**: Choose which class types to include in your calculation
- **Real-time Results**: Get instant feedback on your attendance status
- **Modern UI**: Clean, intuitive interface with responsive design

## Getting Started

### Installation

1. Clone the repository

```bash
git clone https://github.com/lazy0ne369/axio-attendance-calculator.git
cd axio-attendance-calculator/ltps-calc
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the `ltps-calc` directory (never commit it):

```
VITE_WEB3FORMS_KEY=your-web3forms-access-key
```

You can obtain a key free at: https://web3forms.com

## Technology Stack

- **React 19**: Leveraging the latest React features for optimal performance
- **Vite**: Fast build tool and development server
- **React Router**: For seamless navigation between pages
- **Modern CSS**: Utilizing advanced CSS features for sleek UI

## Usage

1. Start by selecting which class types to include in your calculation
2. Enter the number of classes attended and total classes for each selected type
3. Calculate your weighted attendance percentage
4. See your status (Meeting requirement, Close to requirement, Below requirement)

## Deployment (Vercel)

1. Push the repository to GitHub (already done if you're reading this)
2. Go to https://vercel.com and import the repo
3. Set Environment Variable in Vercel project settings:
   - Key: `VITE_WEB3FORMS_KEY`
   - Value: (your Web3Forms access key)
4. Deploy – Vercel will detect Vite automatically
5. Test the live Feedback form; you should receive an email

## Contributing

Issues and suggestions welcome. Open an issue or submit a PR.

## License

MIT
