import { fn } from '../../lib/types/fn';
import { StudentInput } from '../model/student';

export const buildStudent = fn(StudentInput, StudentInput, (input) => ({
  name: input.name,
  email: input.email,
}));
