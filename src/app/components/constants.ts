import { ThreatType } from "../models/alert.enum";
import { AlertType } from "../models/alert.model";

export const initTimeout = 50;
export const initBounceTimeout = 200;

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
}