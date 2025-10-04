export interface MTShipData {
  lat: number;
  lon: number;
  speed: number | null;
  course: number | null;
  heading: number | null;
  elapsed: number | null;
  destination: string | null;
  flag: string | null;
  length: number | null;
  rot: number | null;
  shipname: string;
  shiptype: number;
  shiP_ID: string;
  width: number | null;
  l_FORE: number | null;
  w_LEFT: number | null;
  dwt: number | null;
  gT_SHIPTYPE: number | null;
}
