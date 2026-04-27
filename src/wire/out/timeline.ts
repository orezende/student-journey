export type TimelineEvent = {
  name: string;
  id: string;
  createdAt: string;
};

export type JourneyTimeline = {
  id: string;
  currentStep: string;
  status: string;
  createdAt: string;
  events: TimelineEvent[];
};

export type StudentTimeline = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  journeys: JourneyTimeline[];
};
