export interface AlertType {
  id?: number;
  alerT_TYPE: 'WARNING' | 'DANGER';
  shiP_IDS: string[];
  reason: string;
  historicalPositions?: [number, number, boolean][];
  shouldDisplayTerritorialWaters?: boolean;
  zoomLevel: number;
}
