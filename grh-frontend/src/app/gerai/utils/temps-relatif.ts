export function tempsRelatif(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return "À l'instant";
  if (diff < 60) return `Il y a ${diff} min`;
  const heures = Math.floor(diff / 60);
  if (heures < 24) return `Il y a ${heures}h`;
  const jours = Math.floor(heures / 24);
  if (jours === 1) return 'Hier';
  if (jours < 7) return `Il y a ${jours}j`;
  return `Il y a ${Math.floor(jours / 7)} sem`;
}
