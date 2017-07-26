import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'cg-temp',
  templateUrl: './temp.component.html',
  styleUrls: ['./temp.component.scss']
})
export class TempComponent implements OnInit, OnDestroy {

  private _subs: Array<Subscription>;

  constructor(private http: Http) {}

  ngOnInit() {
    this._subs.push(this.http.get('http://api.application.com').subscribe(this.onApiComplete.bind(this)));
  }

  ngOnDestroy() {
    this._subs.forEach(s=>s.unsubscribe());
  }

  onApiComplete(response: Response) {
    console.log(response);
  }

}
