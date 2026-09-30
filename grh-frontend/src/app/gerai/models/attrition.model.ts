export type RiskLevel = 'ELEVE' | 'MOYEN' | 'FAIBLE';

export interface RiskFactor {
  label  : string;
  impact : number;   // points contributed to score (0–25)
  icon   : string;   // tabler-icon class e.g. "ti ti-calendar-off"
}

export interface AttritionPrediction {
  employeId       : number;
  nom             : string;
  prenom          : string;
  photo?          : string;
  departement     : string;
  poste           : string;
  riskScore       : number;         // 0–100
  riskLevel       : RiskLevel;
  facteurs        : RiskFactor[];
  recommandations : string[];
  lastUpdated     : string;
}

export interface DeptAttritionStat {
  departement  : string;
  avgScore     : number;
  risqueEleve  : number;
  total        : number;
}

export interface AttritionSummary {
  totalEmployes    : number;
  risqueEleve      : number;
  risqueMoyen      : number;
  risqueFaible     : number;
  avgScore         : number;
  deptStats        : DeptAttritionStat[];
}
