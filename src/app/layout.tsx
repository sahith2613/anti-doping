// import './src/app/globals.css'; // Adjust the path to the relative path from your current directory
// import 'C:/Users/vuthu/Desktop/ssih/anti-doping/src/app/globals.css';
// import '@/styles/globals.css';
// import '.src/app/globals.css'; // Use a relative path based on the location of the file

import '../styles/globals.css'

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Anti-Doping Education App',
  description: 'Learn about anti-doping regulations and best practices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
