// #==========# IMPORTACIONES #==========#
import { useRef, useState } from 'react';
import { homeOptions, type HomeOption } from './home-options';

// #==========# INICIO DEL SISTEMA #==========#
export function HomePage() {
  const [selected, setSelected] = useState<HomeOption | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // El diálogo informa el estado real de cada módulo hasta su implementación.
  function openOption(option: HomeOption) {
    setSelected(option);
    dialogRef.current?.showModal();
  }

  return (
    <div className="app-shell">
      {/* #==========# IDENTIDAD DEL SISTEMA #==========# */}
      <header className="app-header">
        <a className="brand" href="/" aria-label="Distribuidora Del Sol, inicio">
          <img className="brand-logo" src="/logo-del-sol.png" alt="" width="88" height="88" />
          <span><strong>Del Sol</strong><span className="brand-caption">Distribuidora</span></span>
        </a>
        <span className="preview-label">Vista previa · Sin sesión iniciada</span>
      </header>

      <main className="home-content">
        {/* #==========# OPCIONES PRINCIPALES #==========# */}
        <div className="home-heading">
          <p className="eyebrow">MENÚ PRINCIPAL</p>
          <h1>¿Qué necesitás hacer?</h1>
          <p className="intro">Elegí una opción para empezar.</p>
        </div>

        {(['Operaciones', 'Administración'] as const).map((group) => (
          <section className="option-section" key={group} aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`}>{group}</h2>
            <div className="option-grid">
              {homeOptions.filter((option) => option.group === group).map((option) => (
                <button
                  className={`option-button${option.id === 'ventas' ? ' option-primary' : ''}`}
                  key={option.id}
                  onClick={() => openOption(option)}
                  aria-haspopup="dialog"
                >
                  <span className="option-title">{option.name}</span>
                  <span className="option-description">{option.description}</span>
                  <span className="option-action">Abrir <span aria-hidden="true">↗</span></span>
                </button>
              ))}
            </div>
          </section>
        ))}
        <p className="home-note">Los módulos están en preparación. El acceso según tu rol se incorporará con el inicio de sesión.</p>
      </main>

      {/* #==========# ESTADO DEL MÓDULO SELECCIONADO #==========# */}
      <dialog ref={dialogRef} className="module-dialog" aria-labelledby="module-title" aria-describedby="module-description">
        <p className="eyebrow">EN PREPARACIÓN</p>
        <h2 id="module-title">{selected?.name}</h2>
        <p id="module-description">{selected?.description} Esta función todavía no está disponible.</p>
        <form method="dialog"><button className="return-button">Volver al inicio</button></form>
      </dialog>
    </div>
  );
}
