import { EmployeAccess } from '../../gerai/models/keycloak-access.model';

export let MOCK_EMPLOYE_ACCESS: EmployeAccess[] = [
  { employeId: 1,  username: 'sara.benali',      accountEnabled: true,  emailVerified: true,  roles: ['employe'],  groups: ['/Informatique'],           createdAt: '2025-09-01', lastLogin: '2026-04-18' },
  { employeId: 2,  username: 'youssef.elfassi',   accountEnabled: true,  emailVerified: true,  roles: ['chef'],     groups: ['/Informatique', '/Managers'], createdAt: '2025-08-15', lastLogin: '2026-04-19' },
  { employeId: 3,  username: 'nadia.oukhouya',    accountEnabled: true,  emailVerified: true,  roles: ['employe'],  groups: ['/Data'],                   createdAt: '2025-10-01', lastLogin: '2026-04-17' },
  { employeId: 4,  username: 'mehdi.cherkaoui',   accountEnabled: true,  emailVerified: true,  roles: ['chef'],     groups: ['/Data', '/Managers'],      createdAt: '2025-07-20', lastLogin: '2026-04-15' },
  { employeId: 5,  username: 'amine.taouil',       accountEnabled: false, emailVerified: false, roles: ['employe'],  groups: ['/Marketing'],              createdAt: '2026-01-10', lastLogin: undefined },
  { employeId: 6,  username: 'leila.bouazzaoui',  accountEnabled: true,  emailVerified: true,  roles: ['employe'],  groups: ['/Marketing'],              createdAt: '2025-11-05', lastLogin: '2026-04-10' },
  { employeId: 7,  username: 'imane.tazi',         accountEnabled: true,  emailVerified: true,  roles: ['admin_rh'], groups: ['/RH', '/Administration'],  createdAt: '2025-06-01', lastLogin: '2026-04-19' },
  { employeId: 8,  username: 'rachid.amsaleg',     accountEnabled: true,  emailVerified: true,  roles: ['admin'],    groups: ['/Informatique', '/Administration', '/Managers'], createdAt: '2025-01-01', lastLogin: '2026-04-19' }
];
