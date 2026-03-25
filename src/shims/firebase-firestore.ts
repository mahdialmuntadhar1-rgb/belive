export function getFirestore() { return {} as any; }
export function collection() { return {} as any; }
export async function addDoc() { return { id: 'stub' } as any; }
export function onSnapshot(_q: any, cb: any) { cb({ docs: [] }); return () => {}; }
export function query(...args: any[]) { return args as any; }
export function orderBy(...args: any[]) { return args as any; }
export function limit(...args: any[]) { return args as any; }
export function serverTimestamp() { return new Date(); }
export function where(...args: any[]) { return args as any; }
export function doc(...args: any[]) { return args as any; }
export async function updateDoc() { return; }
export async function deleteDoc() { return; }
export async function getDocs() { return { docs: [] } as any; }
export async function getDocFromServer() { return { exists: () => false } as any; }
