// lib/validator.ts

import { ValidationError } from '@/app/lib/types/validation';

interface EntityData {
  clients: any[];
  workers: any[];
  tasks: any[];
}

// Helper: Parse phase list syntax "1-3" or [2,4,5]
const parsePhases = (value: string): number[] => {
  try {
    if (value.startsWith('[')) return JSON.parse(value);
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
  } catch {
    return [];
  }
};

export function validateAll(data: EntityData): ValidationError[] {
  const errors: ValidationError[] = [];

  const requiredHeaders = {
    clients: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'],
    workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'],
    tasks: ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'],
  };

  // 1. Missing columns
  for (const [entity, required] of Object.entries(requiredHeaders)) {
    const rows = data[entity as keyof EntityData];
    if (rows.length === 0) continue;
    const actualHeaders = Object.keys(rows[0]);
    required.forEach(header => {
      if (!actualHeaders.includes(header)) {
        errors.push({ entity: entity as any, row: -1, column: header, message: `Missing required column: ${header}`, type: 'error' });
      }
    });
  }

  // 2. Duplicate or empty IDs
  const checkIDs = (rows: any[], key: string, entity: keyof EntityData) => {
    const seen = new Set<string>();
    rows.forEach((row, i) => {
      const id = String(row[key] ?? '').trim();
      if (!id) errors.push({ entity, row: i, column: key, message: 'Missing or empty ID', type: 'error' });
      else if (seen.has(id)) errors.push({ entity, row: i, column: key, message: `Duplicate ID: ${id}`, type: 'error' });
      else seen.add(id);
    });
  };

  checkIDs(data.clients, 'ClientID', 'clients');
  checkIDs(data.workers, 'WorkerID', 'workers');
  checkIDs(data.tasks, 'TaskID', 'tasks');

  // 3. JSON validity
  data.clients.forEach((row, i) => {
    try { JSON.parse(row.AttributesJSON); }
    catch { errors.push({ entity: 'clients', row: i, column: 'AttributesJSON', message: 'Invalid JSON format', type: 'error' }); }
  });

  // 4. PriorityLevel range (1–5)
  data.clients.forEach((row, i) => {
    const n = parseInt(row.PriorityLevel);
    if (isNaN(n) || n < 1 || n > 5) errors.push({ entity: 'clients', row: i, column: 'PriorityLevel', message: 'Must be between 1–5', type: 'error' });
  });

  // 5. Duration >= 1
  data.tasks.forEach((row, i) => {
    const n = parseInt(row.Duration);
    if (isNaN(n) || n < 1) errors.push({ entity: 'tasks', row: i, column: 'Duration', message: 'Must be >= 1', type: 'error' });
  });

  // 6. AvailableSlots array, and MaxLoadPerPhase vs. slots
  data.workers.forEach((row, i) => {
    let slots: number[] = [];
    try { slots = typeof row.AvailableSlots === 'string' ? JSON.parse(row.AvailableSlots) : row.AvailableSlots; }
    catch { errors.push({ entity: 'workers', row: i, column: 'AvailableSlots', message: 'Invalid slot array', type: 'error' }); }

    const maxLoad = parseInt(row.MaxLoadPerPhase);
    if (!Array.isArray(slots)) return;
    if (slots.length < maxLoad) errors.push({ entity: 'workers', row: i, column: 'MaxLoadPerPhase', message: 'Exceeds available slots', type: 'error' });
  });

  // 7. RequestedTaskIDs must exist in tasks
  const validTaskIDs = new Set(data.tasks.map(t => String(t.TaskID).trim()));
  data.clients.forEach((row, i) => {
    const ids = String(row.RequestedTaskIDs || '').split(',').map(x => x.trim());
    ids.forEach(id => {
      if (!validTaskIDs.has(id)) errors.push({ entity: 'clients', row: i, column: 'RequestedTaskIDs', message: `TaskID '${id}' not found`, type: 'error' });
    });
  });

  // 8. PreferredPhases must be valid
  data.tasks.forEach((row, i) => {
    const parsed = parsePhases(row.PreferredPhases);
    if (parsed.length === 0) errors.push({ entity: 'tasks', row: i, column: 'PreferredPhases', message: 'Invalid format (range or list)', type: 'error' });
  });

  // 9. RequiredSkills should match at least one worker
  const allWorkerSkills = data.workers.flatMap(w => String(w.Skills || '').split(',').map(s => s.trim()));
  data.tasks.forEach((row, i) => {
    const required = String(row.RequiredSkills || '').split(',').map(s => s.trim());
    const matched = required.some(skill => allWorkerSkills.includes(skill));
    if (!matched) errors.push({ entity: 'tasks', row: i, column: 'RequiredSkills', message: 'No matching workers found for required skills', type: 'error' });
  });

  // 10. MaxConcurrent must be ≤ qualified workers (rough estimate)
  data.tasks.forEach((row, i) => {
    const max = parseInt(row.MaxConcurrent);
    const reqSkills = String(row.RequiredSkills || '').split(',').map(s => s.trim());
    const qualified = data.workers.filter(w => reqSkills.every(rs => String(w.Skills).includes(rs))).length;
    if (max > qualified) errors.push({ entity: 'tasks', row: i, column: 'MaxConcurrent', message: `Only ${qualified} workers qualify, but MaxConcurrent is ${max}`, type: 'error' });
  });

  return errors;
}
