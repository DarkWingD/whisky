import { Injectable } from '@angular/core'; 
import { environment } from '../environments/environment';

@Injectable() 
export class ConfigService { 
    constructor() {} 
    
    public get adalConfig(): any { 
        return {
            tenant: environment.tenant, 
            clientId: environment.clientid, 
            redirectUri: window.location.origin + '/', 
            postLogoutRedirectUri: window.location.origin + '/' 
        };
    } 
} 