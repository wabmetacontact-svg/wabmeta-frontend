export interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  triggerConfig: any;
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AutomationTrigger = 
  | 'NEW_CONTACT' 
  | 'KEYWORD' 
  | 'WEBHOOK' 
  | 'SCHEDULE' 
  | 'INACTIVITY'
  | 'UNKNOWN_MESSAGE'; // ✅ NEW

export interface AutomationAction {
  id: string;
  type: 
    | 'send_message' 
    | 'send_template' 
    | 'send_text'      // ✅ NEW
    | 'send_audio'     // ✅ NEW
    | 'send_video'     // ✅ NEW
    | 'send_buttons'   // ✅ NEW
    | 'wait_for_response' // ✅ NEW
    | 'add_tag' 
    | 'remove_tag' 
    | 'create_lead' 
    | 'webhook' 
    | 'delay';
  config: any;
}

export interface ButtonConfig {
  id: string;
  text: string;
  action?: string;
}