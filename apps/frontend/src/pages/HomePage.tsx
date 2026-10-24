// #==========# IMPORTACIONES #==========#
import { useState } from 'react';
import { homeOptions, type HomeOption } from './home-options';

// #==========# MENÚ LATERAL PLEGABLE #==========#
// Una sola sección abierta a la vez. Los permisos se incorporarán con el login.
function Sidebar({ selected, onSelect }: {
  selected: HomeOption | null;
  onSelect: (option: HomeOption | null) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>('Operaciones');

  return (
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Distribuidora Del Sol, inicio">
        <img className="brand-logo" src="/logo-del-sol.png" alt="" width="88" height="88" />
        <span><strong>Del Sol</strong><span className="brand-caption">Distribuidora</span></span>
      </a>

      <nav className="sidebar-nav" aria-label="Opciones del sistema">
        <button className={`sidebar-home${!selected ? ' is-active' : ''}`} onClick={() => onSelect(null)} aria-current={!selected ? 'page' : undefined}>
          Inicio
        </button>

        {(['Operaciones', 'Administración'] as const).map((group, index) => {
          const isOpen = openGroup === group;
          const panelId = `sidebar-panel-${index}`;

          return (
            <section className="accordion-section" key={group}>
              <h2>
                <button className="accordion-trigger" id={`sidebar-heading-${index}`} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenGroup(isOpen ? null : group)}>
                  {group}
                  <span className="accordion-symbol" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </h2>
              <div className="accordion-panel" id={panelId} aria-labelledby={`sidebar-heading-${index}`} hidden={!isOpen}>
                {homeOptions.filter((option) => option.group === group).map((option) => (
                  <button className={`sidebar-option${selected?.id === option.id ? ' is-active' : ''}`} key={option.id} onClick={() => onSelect(option)} aria-current={selected?.id === option.id ? 'page' : undefined}>
                    {option.name}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </nav>
      <p className="sidebar-note">Sistema de gestión</p>
    </aside>
  );
}

// #==========# ÁREA DE TRABAJO #==========#
export function HomePage() {
  const [selected, setSelected] = useState<HomeOption | null>(null);

  return (
    <div className="app-shell">
      <Sidebar selected={selected} onSelect={setSelected} />
      <div className="workspace">
        <header className="workspace-header">
          <span>{selected?.group ?? 'Inicio'}</span>
          <span className="preview-label">Distribuidora Del Sol</span>
        </header>
        <main className="home-content" id="main-content">
          <div className="home-heading">
            <p className="eyebrow">{selected ? 'MÓDULO DEL SISTEMA' : 'MENÚ PRINCIPAL'}</p>
            <h1>{selected?.name ?? 'Bienvenido a Del Sol'}</h1>
            <p className="intro">{selected?.description ?? 'Elegí una opción del menú de la izquierda para empezar.'}</p>
          </div>
          {/* #==========# ESTADO REAL DEL DESARROLLO #==========# */}
          <section className="workspace-notice" aria-live="polite">
            <h2>{selected ? 'Este módulo está en preparación' : 'Tu espacio de trabajo'}</h2>
            <p>{selected ? 'La funcionalidad todavía no está disponible. Podés seleccionar otra opción del menú.' : 'Desde el menú podés acceder a ventas, productos, clientes y las demás opciones del sistema. Pulsá una sección para desplegar sus opciones.'}</p>
          </section>
          <p className="home-note">Los módulos del negocio y sus permisos específicos están en preparación.</p>
        </main>
      </div>
    </div>
  );
}
