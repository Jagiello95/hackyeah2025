export interface AlertType {
  alerT_TYPE: 'WARNING' | 'DANGER';
  shiP_IDS: string[];
  reason: string;
  historicalPosition?: [number, number];
  shouldDisplayTerritorialWaters?: boolean;
}
