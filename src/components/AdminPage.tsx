import { useEffect } from 'react';

export function AdminPage() {
  useEffect(() => {
    // Redireciona para o painel admin do backend
    // O backend roda na porta 5000 por padrão
    window.location.href = 'http://localhost:5000/admin';
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#FFF0F5',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid #FF1493', 
          borderTopColor: 'transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: '#2D1B2E' }}>Redirecionando para o painel admin...</p>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
          Se não redirecionar, <a href="http://localhost:5000/admin" style={{ color: '#FF1493' }}>clique aqui</a>
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
