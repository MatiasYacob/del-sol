// #==========# LÍMITES ACORDADOS DE SESIÓN #==========#
export const IDLE_MS = 5 * 60 * 60 * 1000;
export const ABSOLUTE_MS = 6 * 60 * 60 * 1000;
export const COOKIE_NAME = 'del_sol_session';

export function sessionExpired(created: number, activity: number, now: number): boolean {
  return now - created >= ABSOLUTE_MS || now - activity >= IDLE_MS;
}
