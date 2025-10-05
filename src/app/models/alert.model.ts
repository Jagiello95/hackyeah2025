import { ThreatType } from './alert.enum';

export interface AlertType {
  id?: number;
  alerT_TYPE: 'WARNING' | 'DANGER';
  shiP_IDS: string[];
  reason: string;
  historicalPositions?: [number, number, boolean][];
  shouldDisplayTerritorialWaters?: boolean;
  zoomLevel: number;
  type: ThreatType;
  position: string;
  timestamp: string;
}
