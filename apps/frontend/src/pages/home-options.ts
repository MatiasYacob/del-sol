// #==========# OPCIONES DEL SISTEMA #==========#
// Catálogo visual del inicio. Los permisos reales se aplicarán con autenticación.
export const homeOptions = [
  { id: 'ventas', name: 'Ventas', description: 'Ventas minoristas, mayoristas y remitos.', group: 'Operaciones' },
  { id: 'productos', name: 'Productos y stock', description: 'Catálogo, existencias y movimientos.', group: 'Operaciones' },
  { id: 'clientes', name: 'Clientes', description: 'Datos, pagos y cuentas corrientes.', group: 'Operaciones' },
  { id: 'caja', name: 'Caja', description: 'Cobros, movimientos y cierre diario.', group: 'Operaciones' },
  { id: 'presupuestos', name: 'Presupuestos', description: 'Preparación y consulta de cotizaciones.', group: 'Operaciones' },
  { id: 'proveedores', name: 'Proveedores', description: 'Datos, obligaciones y pagos.', group: 'Operaciones' },
  { id: 'compras', name: 'Órdenes de compra', description: 'Pedidos de mercadería a proveedores.', group: 'Operaciones' },
  { id: 'reportes', name: 'Reportes', description: 'Información de ventas, stock y deudas.', group: 'Administración' },
  { id: 'usuarios', name: 'Usuarios y permisos', description: 'Accesos y roles del equipo.', group: 'Administración' },
  { id: 'chatbot', name: 'Asistente de consultas', description: 'Consultas de productos y clientes.', group: 'Administración' },
] as const;

export type HomeOption = (typeof homeOptions)[number];
