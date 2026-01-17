import LogoGenerator from '@/components/LogoGenerator';
import './globals.css';

export default function Home() {
  return (
    <main className="main-container">
      <div className="crt-screen">
        <div className="scanlines"></div>
        <div className="content">
          <h1 className="pixel-title">PIXEL LOGO FORGE</h1>
          <p className="subtitle">RETRO ARCADE LOGO GENERATOR</p>
          <LogoGenerator />
        </div>
      </div>
    </main>
  );
}
