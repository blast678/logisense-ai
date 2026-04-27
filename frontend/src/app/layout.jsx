// src/app/layout.jsx (or app/layout.jsx)
import './global.css'; // Make sure you have your CSS imported

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}