export interface TimeCapsule {
  id: string;
  year: number;
  targetDate: string; // ISO or formatted date
  title: string;
  category: string;
  custodian: string;
  description: string;
  shaKey: string;
  imageUrl: string;
  targetTimestamp: number; // For live odometer countdown
}

export interface StepPhase {
  number: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  technicalTag: string;
  iconName: string;
}

