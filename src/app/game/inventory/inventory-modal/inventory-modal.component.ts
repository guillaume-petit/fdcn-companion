import {Component, Input, OnInit} from '@angular/core';
import {IonItemSliding, ModalController} from "@ionic/angular";
import {Character} from "../../character/character.model";
import {InventoryItem, ITEMS} from "../inventory-item.model";

@Component({
  selector: 'app-inventory-modal',
  templateUrl: './inventory-modal.component.html',
  styleUrls: ['./inventory-modal.component.scss'],
})
export class InventoryModalComponent implements OnInit {

  @Input() billy: Character;

  constructor(
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  async toggleItemSliding(itemSliding: IonItemSliding) {
    await ((await itemSliding.getSlidingRatio()) > 0 ? itemSliding.close() : itemSliding.open('end'));
  }

  get availableItems() {
    return ITEMS.filter(item => !this.billy.items.find(i => item.paragraph === i.paragraph));
  }

  onAddItem(item: InventoryItem) {
    this.billy.items.push(item);
  }

  onDeleteItem(i: number) {
    this.billy.items.splice(i, 1);
  }

}
