import { AlertType } from '../../models/alert.model';

export const MOCK_ALERTS: AlertType[] = [
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['665599'],
    reason: 'a cutter floating close to underwater cables',
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['3647286', '2460691'],
    reason: 'two tankers close to each other',
  },
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['728090'],
    reason: 'Illegal fishing',
  },
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['4876747'],
    reason: 'GPS signal lost',
    historicalPosition: [0, 0],
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['TnpBMU9Ea3lOekExT0RreU56QTFPQT09LVZSNW9ibzhVbHMxZWFjcHhZVGZtc0E9PQ=='],
    reason: 'Entering territorial waters',
  },
];
