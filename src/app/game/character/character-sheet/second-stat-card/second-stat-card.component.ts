import {Component, Input, OnInit} from '@angular/core';
import {Character} from "../../character.model";
import {CharacterStat} from "../../character-stat.model";

@Component({
  selector: 'app-second-stat-card',
  templateUrl: './second-stat-card.component.html',
  styleUrls: ['./second-stat-card.component.scss'],
})
export class SecondStatCardComponent implements OnInit {
  @Input() editing: boolean;
  @Input() stat: CharacterStat;

  constructor() { }

  ngOnInit() {}

}
