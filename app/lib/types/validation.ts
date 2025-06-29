

export interface ValidationError {
  entity: 'clients' | 'workers' | 'tasks';
  row: number; 
  column: string; 
  message: string; 
  type: 'error' | 'warning'; 
}