export type TaskStatus = 'backlog' | 'next' | 'doing' | 'done';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    operating_mode: 'grounded' | 'strategic';
    avatar_url?: string;
}

export interface OperatingSystem {
    work_hours: { start: string; end: string };
    tone_guidelines: string;
    approval_rules: any;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    vision_statement?: string;
    status: 'active' | 'on_hold' | 'completed' | 'archived';
    deadline?: string;
}

export interface Task {
    id: string;
    project_id?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    user_id: string; // Foreign Key
    assignee?: {     // Joined Data
        username: string;
    };
}

export interface Decision {
    id: string;
    decision_text: string;
    context?: string;
    decided_at: string;
    tags: string[];
}

// CREA Core Types
export type CreaMode = 'grounded' | 'strategic';

export interface DialogContext {
    mode: CreaMode;
    confidenceScore: number; // 0-1
    relevantEvidence: any[];
}
