// #==========# IMPORTACIONES #==========#
import { createRoot } from 'react-dom/client';
import { HomePage } from './pages/HomePage';
import './styles.css';

// #==========# PANTALLA INICIAL #==========#
function App() {
  return <HomePage />;
}

// #==========# MONTAJE DE REACT #==========#
// Conecta la aplicación con el contenedor declarado en index.html.
const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(<App />);
