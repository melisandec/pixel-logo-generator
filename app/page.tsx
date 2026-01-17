import LogoGenerator from '@/components/LogoGenerator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="main-container">
        <div className="crt-screen">
          <div className="scanlines"></div>
          <div className="content">
            <h1 className="pixel-title">PIXEL LOGO FORGE</h1>
            <p className="subtitle">RETRO ARCADE LOGO GENERATOR</p>
            <LogoGenerator />
            <footer className="main-footer">
              Built for the Farcaster community • Generate, save, and cast your pixel logo
            </footer>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
