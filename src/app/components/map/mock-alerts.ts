import { ThreatType } from '../../models/alert.enum';
import { AlertType } from '../../models/alert.model';

import { subMinutes } from 'date-fns';

export const MOCK_ALERTS: AlertType[] = [
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['665599'],
    reason: 'a cutter floating close to underwater cables',
    zoomLevel: 12,
    type: ThreatType.cable,
    position: 'Poland',
    timestamp: subMinutes(new Date(), 14).toISOString(),
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['3647286', '2460691'],
    reason: 'two tankers close to each other',
    zoomLevel: 10,
    type: ThreatType.tankers,
    position: 'Poland',
    timestamp: subMinutes(new Date(), 26).toISOString(),
  },
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['728090'],
    reason: 'Illegal fishing',
    zoomLevel: 6,
    type: ThreatType.fishing,
    position: 'Poland',
    timestamp: subMinutes(new Date(), 38).toISOString(),
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
    timestamp: subMinutes(new Date(), 50).toISOString(),
  },
  {
    alerT_TYPE: 'DANGER',
    shiP_IDS: ['756295'],
    reason: 'Entering territorial waters',
    shouldDisplayTerritorialWaters: true,
    zoomLevel: 6,
    type: ThreatType.territorial,
    position: 'Poland',
    timestamp: subMinutes(new Date(), 76).toISOString(),
  },
  {
    alerT_TYPE: 'WARNING',
    shiP_IDS: ['TXpnMU16VTVNemcxTXpVNU16ZzFNdz09LXRsRzB2YmhxRVd3bUxVa3VNMnhOS0E9PQ=='],
    reason: 'Cargo - Port mismatch',
    shouldDisplayTerritorialWaters: true,
    zoomLevel: 9,
    type: ThreatType.cargoPortMismatch,
    position: 'Somalia',
    timestamp: subMinutes(new Date(), 76).toISOString(),
    description:
      'Kismayo Port has no pipelines, loading arms, or fire suppression systems typical for oil terminals. A tanker has no legitimate unloading purpose.',
  },
];
