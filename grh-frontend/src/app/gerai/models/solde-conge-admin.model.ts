export interface SoldeCongeAdmin {
  id                : number;
  employeId         : number;
  employeNom        : string;
  employePhoto     ?: string;
  departement      ?: string;
  poste            ?: string;
  annee             : number;

  // Balances
  soldePrecedent    : number;   // Previous balance (carried from last year)
  soldeActuel       : number;   // Current remaining balance
  soldeTotal        : number;   // Total allocated this year
  reportSolde       : number;   // Carry-over balance added to this year

  // Leave counts
  congesUtilises    : number;   // Total days consumed (approved & taken)
  congesAcceptes    : number;   // Approved requests count
  congesRejetes     : number;   // Rejected requests count
  congesExpires     : number;   // Days lost due to expiry
}
