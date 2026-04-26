import { fn } from '../../lib/types/fn';
import { Journey, JourneyRecord, JourneyStep, JourneyStatus } from '../model/journey';
import { JourneyWireOut } from '../wire/out/journey';
import { StudentInput } from '../model/student';
import { StartJourneyWireIn } from '../wire/in/journey';
import { JourneyDbWire } from '../db/wire/journey';
import { asUUID } from '../../lib/types/uuid';

export const fromWireIn = fn(
  StartJourneyWireIn,
  StudentInput,
  (wire) => ({
    name: wire.name,
    email: wire.email,
  }),
);

export const toWireOut = fn(
  Journey,
  JourneyWireOut,
  (journey) => ({
    id: journey.id,
    studentId: journey.studentId,
    currentStep: journey.currentStep,
    status: journey.status,
    createdAt: journey.createdAt.toISOString(),
  }),
);

export const fromDbWire = fn(
  JourneyDbWire,
  Journey,
  (wire) => ({
    id: asUUID(wire.id),
    studentId: asUUID(wire.student_id),
    currentStep: wire.current_step as JourneyStep,
    status: wire.status as JourneyStatus,
    createdAt: wire.created_at,
  }),
);

export const toDbWire = fn(
  JourneyRecord,
  JourneyDbWire,
  (journey) => {
    const row = new JourneyDbWire();
    row.student_id = journey.studentId;
    row.current_step = journey.currentStep;
    row.status = journey.status;
    return row;
  },
);
