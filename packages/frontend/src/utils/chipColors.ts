export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

export function priorityColor(priority?: string): ChipColor {
  switch (priority) {
    case 'Critical': return 'error';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    case 'Low': return 'default';
    default: return 'default';
  }
}

export function statusColor(status?: string): ChipColor {
  switch (status) {
    case 'Open': return 'info';
    case 'In Progress': return 'primary';
    case 'Waiting for Customer':
    case 'Waiting for Support': return 'warning';
    case 'Resolved':
    case 'Closed': return 'success';
    case 'Reopened': return 'error';
    default: return 'default';
  }
}

export function severityColor(severity?: string): ChipColor {
  switch (severity) {
    case 'Severity 1': return 'error';
    case 'Severity 2': return 'warning';
    case 'Severity 3': return 'info';
    case 'Severity 4': return 'default';
    default: return 'default';
  }
}

export function slaColor(status?: string): ChipColor {
  switch (status) {
    case 'Met': return 'success';
    case 'At Risk': return 'warning';
    case 'Breached': return 'error';
    default: return 'default';
  }
}

export function criticalityColor(criticality?: string): ChipColor {
  switch (criticality) {
    case 'Critical': return 'error';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    case 'Low': return 'default';
    default: return 'default';
  }
}

export function healthScoreColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

export function safeParseArray(json?: string): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function safeParseJSON<T>(json: string | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
