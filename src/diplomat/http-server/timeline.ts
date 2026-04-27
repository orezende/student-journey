import { get } from '../../../lib/http/server/index';
import { type StudentTimeline, type TimelineEvent } from '../../wire/out/timeline';
import * as studentDb from '../../db/student';
import * as journeyDb from '../../db/journey';
import * as journeyInitiatedDb from '../../db/journey-initiated';
import * as diagnosticTriggeredDb from '../../db/diagnostic-triggered';
import * as diagnosticCompletedDb from '../../db/diagnostic-completed';
import * as analysisStartedDb from '../../db/analysis-started';
import * as analysisFinishedDb from '../../db/analysis-finished';
import * as curriculumGeneratedDb from '../../db/curriculum-generated';
import * as contentDispatchedDb from '../../db/content-dispatched';
import * as studentEngagementReceivedDb from '../../db/student-engagement-received';
import * as progressMilestoneReachedDb from '../../db/progress-milestone-reached';
import * as journeyCompletedDb from '../../db/journey-completed';

const EVENT_TABLES = [
  ['JOURNEY_INITIATED', journeyInitiatedDb],
  ['DIAGNOSTIC_TRIGGERED', diagnosticTriggeredDb],
  ['DIAGNOSTIC_COMPLETED', diagnosticCompletedDb],
  ['ANALYSIS_STARTED', analysisStartedDb],
  ['ANALYSIS_FINISHED', analysisFinishedDb],
  ['CURRICULUM_GENERATED', curriculumGeneratedDb],
  ['CONTENT_DISPATCHED', contentDispatchedDb],
  ['STUDENT_ENGAGEMENT_RECEIVED', studentEngagementReceivedDb],
  ['PROGRESS_MILESTONE_REACHED', progressMilestoneReachedDb],
  ['JOURNEY_COMPLETED', journeyCompletedDb],
] as const;

export function registerTimelineRoutes(): void {
  get('/timeline', async (): Promise<StudentTimeline[]> => {
    const [students, journeys, ...eventResults] = await Promise.all([
      studentDb.findAll(),
      journeyDb.findAll(),
      ...EVENT_TABLES.map(([, db]) => db.findAll()),
    ]);

    const eventsByJourney = new Map<string, TimelineEvent[]>();
    for (let i = 0; i < EVENT_TABLES.length; i++) {
      const name = EVENT_TABLES[i][0];
      for (const event of eventResults[i]) {
        const list = eventsByJourney.get(event.journeyId) ?? [];
        list.push({ name, id: event.id, createdAt: event.createdAt.toISOString() });
        eventsByJourney.set(event.journeyId, list);
      }
    }

    for (const events of eventsByJourney.values()) {
      events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    const journeysByStudent = new Map<string, typeof journeys>();
    for (const journey of journeys) {
      const list = journeysByStudent.get(journey.studentId) ?? [];
      list.push(journey);
      journeysByStudent.set(journey.studentId, list);
    }

    return students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      createdAt: student.createdAt.toISOString(),
      journeys: (journeysByStudent.get(student.id) ?? []).map((journey) => ({
        id: journey.id,
        currentStep: journey.currentStep,
        status: journey.status,
        createdAt: journey.createdAt.toISOString(),
        events: eventsByJourney.get(journey.id) ?? [],
      })),
    }));
  });
}
