export interface Choice {
  id: string;
  text: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  schedule: ScheduleItem[];
  venue: string;
  organizer: string;
  createdAt: string;
  closedAt: string | null;
  isOpen: boolean;
}

export interface Vote {
  id: string;
  eventId: string;
  choiceId: string;
  createdAt: string;
  voterToken: string;
}

export interface VoteCount {
  choiceId: string;
  choiceText: string;
  count: number;
}

export interface SessionData {
  uid: string;
  email: string;
}
