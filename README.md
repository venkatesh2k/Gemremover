# Gemini Watermark Remover Dashboard

A premium, high-performance web tool designed to remove Gemini AI watermarks from images with 100% precision. Built with a sleek **Elite Noir & Royal Gold** theme and powered by a lossless Reverse Alpha Blending algorithm.

## ✨ Features

-   **Lossless Restoration**: Uses mathematical reverse alpha blending to perfectly restore pixels behind watermarks.
-   **Premium Dashboard UI**: A modern SaaS-style interface with sidebar navigation and cinematic entrance animations.
-   **Batch Processing**: Process multiple images simultaneously with real-time progress tracking.
-   **ZIP Export**: Download all cleaned images in a single high-speed archive.
-   **100% Client-Side**: All processing happens in your browser. No images are ever uploaded to a server, ensuring total privacy.
-   **Multi-Tired UI Display**: Professional feature plan section detailing Free, Pro, and Enterprise capabilities.

## 🛠 Tech Stack

-   **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6 Modules)
-   **Core Logic**: Reverse Alpha Blending Algorithm
-   **Dependencies**: 
    -   `JSZip` for batch compression
    -   `Exifr` for standard EXIF handling
-   **Design**: Glassmorphism, CSS Grid, Custom Path Animations

## 🚀 Getting Started

Since the dashboard uses ES6 modules, it requires a local server to run.

### Prerequisites
-   [Node.js](https://nodejs.org/) installed on your system.

### Installation & Launch

1.  **Clone or Download** the project folder.
2.  Navigate to the directory in your terminal:
    ```bash
    cd gemini_remover
    ```
3.  **Run with npx (Recommended)**:
    ```bash
    npx serve
    ```
4.  Open your browser and navigate to `http://localhost:3000`.

## 📁 Project Structure

```text
gemini_remover/
├── core/                # Core Algorithm & Engine
│   ├── watermarkEngine.js # Logic orchestration
│   ├── alphaMap.js        # Detection patterns
│   ├── blendModes.js      # Mathematical operations
│   └── *.png              # Watermark reference assets
├── img/                 # UI Brand Assets
├── index.html           # Dashboard Entry Point
├── style.css            # Premium Theme Styles
├── main.js              # Application Orchestration
└── README.md            # Documentation
```

## ⚖ License
This project is for educational and research purposes only. Please respect all copyright laws and Google's terms of service when using this tool.
