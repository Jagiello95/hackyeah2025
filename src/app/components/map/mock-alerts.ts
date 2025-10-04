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
    shiP_IDS: ['TkRnMU9UUTJORGcxT1RRMk5EZzFPUT09LXdkMTQ1OExSVzBVTnZMZHo4TUVYRUE9PQ=='],
    reason: 'GPS signal lost',
    historicalPosition: [143.91833, 46.823334],
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['756295'],
    reason: 'Entering territorial waters',
    shouldDisplayTerritorialWaters: true,
  },
];
