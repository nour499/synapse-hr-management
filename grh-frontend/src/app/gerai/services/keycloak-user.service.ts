import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface KeycloakUser {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

@Injectable({
    providedIn: 'root'
})
export class KeycloakUserService {

    private API = `${environment.apiUrl}/keycloak/users`;
    constructor(private http: HttpClient) { }

    getUsers(): Observable<KeycloakUser[]> {
        return this.http.get<KeycloakUser[]>(this.API);
    }

}