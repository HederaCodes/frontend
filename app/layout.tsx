import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HederaCodes - AI Code Replicator",
  description: "Your personalized AI coding assistant that mimics your exact coding style",
  keywords: "AI, coding, programming, code generation, personalized AI",
  authors: [{ name: "HederaCodes Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-gradient-animate">
          <Navigation />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <footer className="glass-effect border-t border-white/10 py-6">
            <div className="container-responsive mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <span className="text-white/70 text-sm">© {new Date().getFullYear()} HederaCodes. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Add a sophisticated cursor effect */}
        <Script id="cursor-effect">
          {`
            document.addEventListener('DOMContentLoaded', function() {
              const cursor = document.createElement('div');
              cursor.className = 'custom-cursor';
              cursor.style.cssText = 'position: fixed; width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255,255,255,0.7); pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease, opacity 0.2s ease;';
              document.body.appendChild(cursor);
              
              const cursorBorder = document.createElement('div');
              cursorBorder.className = 'cursor-border';
              cursorBorder.style.cssText = 'position: fixed; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); pointer-events: none; z-index: 9998; transform: translate(-50%, -50%); transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease;';
              document.body.appendChild(cursorBorder);
              
              document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
                
                // Add a slight delay to the border for smooth effect
                setTimeout(() => {
                  cursorBorder.style.left = e.clientX + 'px';
                  cursorBorder.style.top = e.clientY + 'px';
                }, 50);
              });
              
              // Scale effect on interactive elements
              document.querySelectorAll('a, button, input, textarea, select, [role="button"]').forEach(el => {
                el.addEventListener('mouseenter', () => {
                  cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                  cursor.style.background = 'rgba(59, 130, 246, 0.7)';
                  cursorBorder.style.width = '30px';
                  cursorBorder.style.height = '30px';
                  cursorBorder.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                });
                
                el.addEventListener('mouseleave', () => {
                  cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                  cursor.style.background = 'rgba(255,255,255,0.7)';
                  cursorBorder.style.width = '40px';
                  cursorBorder.style.height = '40px';
                  cursorBorder.style.borderColor = 'rgba(255,255,255,0.3)';
                });
              });
              
              // Hide on document leave
              document.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                cursorBorder.style.opacity = '0';
              });
              
              document.addEventListener('mouseenter', () => {
                cursor.style.opacity = '1';
                cursorBorder.style.opacity = '1';
              });
            });
          `}
        </Script>
      </body>
    </html>
  );
}
