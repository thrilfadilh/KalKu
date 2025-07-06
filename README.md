# KalKu-KalkulatorKu

## Project Overview
Kalkulatorku is an innovative interactive calculator web application that transforms mathematical computations into an engaging, educational visual experience. Leveraging knowledge acquired from IBM SkillsBuild courses (MDL-504, MDL-566, MDL-567), this project integrates IBM Granite to generate calculation logic and dynamic animations using p5.js. Users interact via “Touch Crystals” (geometrically styled buttons), observe “Number Bubbles” and “Operation Trails” in a responsive canvas, and experience “Bubble Fusion” animations for results. Additional features, including a dark mode toggle and visual history, enhance accessibility and learning outcomes.

## Technologies Used
- **HTML/CSS**: Provides the structural foundation and responsive, minimalist design.
- **JavaScript/p5.js**: Implements canvas-based animations and core logic.
- **IBM Granite**: An AI model, accessed via IBM SkillsBuild, utilized for calculation logic and animation design.
- **Netlify**: Employed for seamless deployment and live hosting.

## Features
- **Dynamic Canvas**: Visualizes numbers as variably sized bubbles and operations as colored trails (e.g., blue for addition, red for subtraction).
- **Touch Crystals**: Input buttons featuring ripple and pulse effects for an intuitive user experience.
- **Bubble Fusion**: An animated result display with a subtle light burst effect.
- **Canvas Reset**: A graceful evaporation animation to clear calculations.
- **Visual History**: A sidebar displaying previous calculations for reference.
- **Dark Mode Toggle**: A user-selectable theme option to improve comfort and accessibility.

## Setup Instructions
1. Clone the repository: `git clone https://github.com/thrilfadilh/KalKu.git`.
2. Open `index.html` in a modern web browser (e.g., Chrome or Edge).
3. Engage with the interface by inputting numbers and operators, pressing “=” for results, and utilizing the toggle to switch modes.
4. Review the calculation history in the sidebar and reset with the “C” button as needed.

## AI Usage
IBM Granite, mastered through IBM SkillsBuild training, was extensively utilized:
- **Calculation Logic**: Generated the `evaluateExpression()` function using the Shunting Yard algorithm (e.g., “5 + 3 * 2” → 11), optimized based on insights from MDL-504.
- **Animation Design**: Produced detailed animation descriptions (e.g., “two bubbles merging with a light burst effect”) implemented in `animateResultFusion()`, informed by MDL-566.
- **Prompting**: A sample prompt executed in Google Colab: “Generate JavaScript for a calculator with bubble visualization using p5.js, include comments.”
- Evidence of usage is documented in commit logs and code comments (e.g., “IBM Granite-optimized logic”).

## Impact
- **Educational Value**: Enhances mathematical understanding for beginners, aligning with SkillsBuild objectives.
- **User Engagement**: The interactive design fosters sustained interest and interaction.
- **Innovation**: The integration of AI distinguishes Kalkulatorku from traditional calculators.

## Live Demo
[https://kalku-kalkulatorku.netlify.app](https://kalku-kalkulatorku.netlify.app)

## Acknowledgments
Grateful acknowledgment to Hacktiv8 and IBM SkillsBuild for providing the training and access to Granite that enabled this project’s development.
