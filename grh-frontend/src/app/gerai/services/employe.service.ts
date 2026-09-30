import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Employe } from "../../theme/shared/interfaces/employe";
import { StatistiquesEmploye } from "../../theme/shared/interfaces/statistiques-employe";
import { CreateEmployeDTO } from "../../theme/shared/interfaces/create-employe-dto";
//SERVICE

@Injectable({
    providedIn: 'root' //Service disponible dans toute l'application
})
export class EmployeService {
    //Injection du HttpClient (pour faire des appels HTTP
    private http = inject(HttpClient);

    private apiUrl = '/api/employes';

    //METHODES PUBLIQUES

    /**
     * Recuperer tous les employes
     * @returns Observable<Employe[]>
     */

    //Récupérer la liste de tous les employés
    getEmployes(): Observable<Employe[]> {
        return this.http.get<Employe[]>(this.apiUrl).pipe(
            catchError(this.handleError) //Gestion des erreurs
        );
    }

    getEmployeById(id: number): Observable<Employe> {
        return this.http.get<Employe>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    getStatistiques(employeId?: number): Observable<StatistiquesEmploye> {
        const url = employeId
            ? `${this.apiUrl}/${employeId}/stats`
            : `${this.apiUrl}/stats`;

        return this.http.get<StatistiquesEmploye>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    //Creer un nouvel employe
    createEmploye(employe: CreateEmployeDTO): Observable<Employe> {
        return this.http.post<Employe>(this.apiUrl, employe).pipe(
            catchError(this.handleError)
        );
    }

    //Mettre a jour un employe
    upadteEmploye(id: number, employe: Partial<Employe>): Observable<Employe> {
        return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe).pipe(
            catchError(this.handleError)
        );
    }

    //Supprimer un employe
    deleteEmploye(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    //Recuperer les employes d'une equipe
    getEmployesByChef(chefId: number): Observable<Employe[]> {
        return this.http.get<Employe[]>(`${this.apiUrl}/chef/${chefId}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    //Rechercher des employes par nom ou email
    searchEmployes(query: string): Observable<Employe[]> {
        return this.http.get<Employe[]>(`${this.apiUrl}/search?q=${query}`).pipe(
            catchError(this.handleError)
        );
    }

    //Methodes prives(Gestion erreurs)
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
            // Erreur côté client
            errorMessage = `Erreur client: ${error.error.message}`;
        } else {
            // Erreur côté serveur
            switch (error.status) {
                case 400:
                    errorMessage = 'Demande invalide. Veuillez vérifier les données saisies.';
                    break;
                case 401:
                    errorMessage = 'Non autorise. Veuillez vous reconnecter.';
                    break;
                case 403:
                    errorMessage = 'Non autorise. Veuillez vous reconnecter.';
                    break;
                case 404:
                    errorMessage = 'Employe non trouvee.';
                    break;
                case 500:
                    errorMessage = 'Erreur serveur. Veuillez reessayer plus tard.';
                    break;
                default:
                    errorMessage = `Erreur ${error.status}: ${error.message}`;
            }
        }

        console.error('Erreur EmployeService:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }
}