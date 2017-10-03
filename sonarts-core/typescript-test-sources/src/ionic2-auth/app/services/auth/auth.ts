import {Injectable} from 'angular2/core';
import {tokenNotExpired} from 'angular2-jwt';

@Injectable()
export class AuthService {
  constructor() {}
  
  public authenticated() {
    return tokenNotExpired();
  }
}