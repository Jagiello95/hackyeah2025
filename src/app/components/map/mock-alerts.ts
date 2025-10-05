import { ThreatType } from '../../models/alert.enum';
import { AlertType } from '../../models/alert.model';

export const MOCK_ALERTS: AlertType[] = [
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['665599'],
    reason: 'a cutter floating close to underwater cables',
    zoomLevel: 12,
    type: ThreatType.cable,
    position: 'Poland',
    timestamp: new Date().toDateString(),
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['3647286', '2460691'],
    reason: 'two tankers close to each other',
    zoomLevel: 10,
    type: ThreatType.tankers,
    position: 'Poland',
    timestamp: new Date().toDateString(),
  },
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['728090'],
    reason: 'Illegal fishing',
    zoomLevel: 6,
    type: ThreatType.fishing,
    position: 'Poland',
    timestamp: new Date().toDateString(),
  },
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['TkRnMU9UUTJORGcxT1RRMk5EZzFPUT09LXdkMTQ1OExSVzBVTnZMZHo4TUVYRUE9PQ=='],
    reason: 'GPS signal lost',
    historicalPositions: [
      // [145.91833, 48.823334, true],
      [148.91833, 50.823334, true],
      [150.91833, 51.823334, false],
      [152.91833, 52.823334, false],
      [154.91833, 53.823334, false],
    ],
    zoomLevel: 4,
    type: ThreatType.spoof,
    position: 'Poland',
    timestamp: new Date().toDateString(),
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['756295'],
    reason: 'Entering territorial waters',
    shouldDisplayTerritorialWaters: true,
    zoomLevel: 6,
    type: ThreatType.territorial,
    position: 'Poland',
    timestamp: new Date().toDateString(),
  },
];
