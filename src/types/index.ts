export interface User {
  id: string;
  username: string;
  role: 'doctor' | 'parent';
}

export interface Incubator {
  parentName: ReactNode;
  babyGender: ReactNode;
  babyDOB: string | number | Date;
  parentID: ReactNode;
  id: string;
  babyName: string;
  temperature: number;
  humidity: number;
  gasLevel: number;
  airQualityIndex: number;
  uvRadiation: number;
  flameDetected: boolean;
  lightIntensity: number;
  lastUpdated: string;
}