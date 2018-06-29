import { Component, OnInit } from '@angular/core';
import { Whisky } from '../whisky';

@Component({
  selector: 'app-whisky-list',
  templateUrl: './whisky-list.component.html',
  styleUrls: ['./whisky-list.component.css']
})
export class WhiskyListComponent implements OnInit {
  whiskyList: any = []; 
  constructor() { }

  ngOnInit() {
    let whisky1 = new Whisky();
    this.whiskyList.push(whisky1);
  }

}
