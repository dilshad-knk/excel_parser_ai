
export interface Worker {
    workerId: string;
    workerName: string;
    skills: string[];
    availableSlots: number[];
    maxLoadPerPhase: number;
    workerGroup: string;
    qualificationLevel: number;
}

export interface Task {
    taskId: string;
    taskName: string;
    category: string;
    duration: number;
    requiredSkills: string[];
    prefferedPhased: number[];
    maxConcurrent: number;
}


export interface Client {
    clieantId: string ;
    clinetName: string;
    priorityLevel: number;
    requestedTaskIDs: string[];
    groupTag: string;
    attributes: ClientAttributes
}

export type ClientAttributes = {
    ocation?: string;
  budget?: number | null;
  sla?: string;
  vip?: boolean;
  notes?: string;
  region?: string;
  contact?: string;
  preferredContact?: string;
  timezone?: string;
  [key: string]: any;
} | string


export interface AppData {
    workers: Worker[];
    tasks: Task[];
    clients: Client[]
}