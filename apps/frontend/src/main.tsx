// #==========# IMPORTACIONES #==========#
import { createRoot } from 'react-dom/client';
import { AuthApp } from './auth/AuthApp';
import './styles.css';

// #==========# PANTALLA INICIAL #==========#
function App() {
  return <AuthApp />;
}

// #==========# MONTAJE DE REACT #==========#
// Conecta la aplicación con el contenedor declarado en index.html.
const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(<App />);
