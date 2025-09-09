<img width="1892" height="951" alt="AI-Refine Landing Page" src="https://github.com/user-attachments/assets/4097e04d-9297-4b0a-9cd7-363e7abc54ee" />


# AI-Refine

An automated image augmentation tool built with Next.js that helps enhance datasets effortlessly for AI training, object detection, and classification tasks.
<img width="1890" height="947" alt="AI-Refine See It For Yourself" src="https://github.com/user-attachments/assets/18a3937d-923c-48fa-9bd7-cbf542cdd962" />
<img width="1906" height="951" alt="image" src="https://github.com/user-attachments/assets/a2ac30c2-771c-43ba-a844-fdeaa1a5d5a4" />



## Features

- **Automated Image Augmentation**: Apply multiple transformations including grayscale, flipping, brightness adjustment, and more
- **Batch Processing**: Upload and process multiple images simultaneously
- **Download as ZIP**: Export all processed images in a convenient ZIP file format
- **Interactive UI**: User-friendly interface with hover effects and smooth transitions
- **Responsive Design**: Works seamlessly across different screen sizes

## Tech Stack

- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Font Awesome)
- **File Processing**: JSZip for batch downloads
- **Backend**: PocketBase integration
- **Fonts**: Oswald & Poppins

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Amenyuwel/Ai-Refine.git
cd Ai-Refine
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```bash
NEXT_PUBLIC_PB_URL=your_pocketbase_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
Ai-Refine/
├── app/
│   ├── context/          # React Context providers
│   ├── feature/          # Feature-specific components
│   │   ├── info/         # Information pages
│   │   └── upload/       # Upload and download functionality
│   ├── pages/            # Static pages
│   ├── utils/            # Utility functions and configurations
│   ├── globals.css       # Global styles
│   └── layout.js         # Root layout component
├── components/           # Reusable UI components
│   ├── Footer.jsx        # Footer with social links
│   └── ToastProvider.jsx # Toast notification provider
└── public/               # Static assets
```

## Usage

1. **Upload Images**: Navigate to the upload section and select multiple images
2. **Apply Filters**: Choose from various augmentation options
3. **Preview Results**: View the processed images in real-time
4. **Download**: Export all processed images as a ZIP file

## Image Augmentation Features

- Grayscale conversion
- Image flipping (horizontal/vertical)
- Brightness adjustment
- And more transformations to improve model performance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Perfect for AI training, object detection, and classification tasks. Enhance your dataset effortlessly with automated image augmentation!
