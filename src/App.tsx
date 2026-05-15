import { useEffect, useState } from 'react';
import { S3Provider, useS3 } from './hooks/useS3';
import { Login } from './components/Login';
import { Explorer } from './components/Explorer';
import { Database, LogOut, Sun, Moon } from 'lucide-react';
import './App.css';

function MainApp() {
  const { credentials, disconnect } = useS3();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightMode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (credentials) {
        e.preventDefault();
        e.returnValue = 'Your session is volatile. Refreshing will clear your credentials and close the vault. Are you sure?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [credentials]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <Database size={28} color="var(--text-highlight)" />
          <h1>JAGAH</h1>
        </div>
        
        <div className="header-actions">
          {credentials && (
            <>
              <span className="current-bucket">
                Bucket: <strong>{credentials.bucketName}</strong>
              </span>
              <button className="btn-danger" onClick={disconnect} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} />
                Disconnect
              </button>
            </>
          )}
          <button 
            onClick={() => setIsLightMode(!isLightMode)} 
            style={{ 
              background: 'transparent', 
              color: 'var(--text-main)', 
              padding: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!credentials ? <Login /> : <Explorer />}
      </main>

      <footer className="app-footer">
        <p>Made by <a href="https://satym.in" target="_blank" rel="noopener noreferrer">Satym</a></p>
        <div className="footer-links">
          <a href="https://github.com/satyamsingh5512" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <S3Provider>
      <MainApp />
    </S3Provider>
  );
}

export default App;
