import {Page} from 'ionic-framework/ionic';
import {Http} from 'angular2/http';
import {AuthHttp, tokenNotExpired} from 'angular2-jwt';
import {AuthService} from '../../services/auth/auth';
const map = require('rxjs/add/operator/map');

@Page({
  templateUrl: 'build/pages/quotes/quotes.html',
})
export class QuotesPage {
  API: string = "http://localhost:3001/api";
  quote: string;
  error: string;
  
  constructor(private http: Http, private authHttp: AuthHttp, private auth: AuthService) {}
  
  getQuote() {
    // Use a regular Http call to access unsecured routes
    this.http.get(`${this.API}/random-quote`)
      .map(res => res.text())
      .subscribe(
        data => this.quote = data,
        err => this.error = err
      );
  }
  
  getSecretQuote() {
    // Use authHttp to access secured routes
    this.authHttp.get(`${this.API}/protected/random-quote`)
      .map(res => res.text())
      .subscribe(
        data => this.quote = data,
        err => this.error = err
      );
  }
}