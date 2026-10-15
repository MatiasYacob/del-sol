// #==========# IMPORTACIONES #==========#
import { createRoot } from 'react-dom/client';

// #==========# PANTALLA INICIAL #==========#
// Vista provisional hasta implementar las pantallas del negocio.
function App() {
  return (
    <main>
      <h1>Distribuidora Del Sol</h1>
      <p>Entorno de desarrollo preparado.</p>
    </main>
  );
}

// #==========# MONTAJE DE REACT #==========#
// Conecta la aplicación con el contenedor declarado en index.html.
const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(<App />);
