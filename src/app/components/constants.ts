import { ThreatType } from '../models/alert.enum';
import { AlertType } from '../models/alert.model';

export const initTimeout = 0;
export const initBounceTimeout = 0;

export const alertShipIds = ['5790752'];

export const getIcon = (alert: AlertType) => {
  switch (alert.type) {
    case ThreatType.cable:
      return 'cable';
    case ThreatType.fishing:
      return 'phishing';
    case ThreatType.spoof:
      return 'not_listed_location';
    case ThreatType.tankers:
      return 'oil_barrel';
    case ThreatType.territorial:
      return 'crisis_alert';
    case ThreatType.ai:
      return 'satellite_alt';
    case ThreatType.cargoPortMismatch:
      return 'package_2';
  }
};

export const mockedChatAlerts = [
  {
    ALERT_TYPE: 'DANGER',
    SHIP_ID: 'TXpFd01qSXhNekV3TWpJeE16RXdNZz09LW1remhEKzZsTzVNZisxYkdOcWJ3a0E9PQ==',
    REASON:
      "Status AIS 'At Anchor' przy prędkości ~10 kn (SPEED=100) i kursie 272° – możliwe dryfowanie/ciągnięcie kotwicy lub błąd AIS. Wymagana natychmiastowa weryfikacja i działania zapobiegające kolizji.",
  },
  {
    ALERT_TYPE: 'WARNING',
    SHIP_ID: '9537042',
    REASON:
      'Bardzo mała odległość od innej jednostki na kotwicy (~0.1 NM, ok. 180 m) przy 5.665N 104.92834E – [SAT-AIS] Tug (SHIP_ID: TVRJME1ESTVNVEkwTURJNU1USTBNQT09LUtxQU1kMXdnNXJmL3ZxSEIzbER4dVE9PQ==). Obie jednostki bez ruchu; ryzyko kontaktu w przypadku dryfu lub zmiany warunków. Zalecane zwiększenie separacji i utrzymanie łączności.',
  },
];
