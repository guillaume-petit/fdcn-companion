import {Component, Input, OnInit} from '@angular/core';
import {EquipmentService} from '../../../equipment/equipment.service';
import {ModalController, PopoverController} from '@ionic/angular';
import {SelectEquipmentItemComponent} from './select-equipment-item/select-equipment-item.component';
import {EquipmentItem, EquipmentItemId} from '../../../equipment/equipment-item.model';

@Component({
  selector: 'app-select-equipment-modal',
  templateUrl: './select-equipment-modal.component.html',
  styleUrls: ['./select-equipment-modal.component.scss'],
})
export class SelectEquipmentModalComponent implements OnInit {

  @Input() items: Array<EquipmentItem>;

  constructor(
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  onSelectItem1() {
    this.items[0] = null;
    this.selectItem(result => {
      if (result.role !== 'backdrop') {
        if (result.data.item.id === EquipmentItemId.arc) {
          this.clearWeapons();
        }
        this.items[0] = result.data.item;
      }
    });
  }

  onSelectItem2() {
    this.items[1] = null;
    this.selectItem(result => {
      if (result.role !== 'backdrop') {
        if (result.data.item.id === EquipmentItemId.arc) {
          if (result.data.item.id === EquipmentItemId.arc) {
            this.clearWeapons();
          }
        }
        this.items[1] = result.data.item;
      }
    });
  }

  onSelectItem3() {
    this.items[2] = null;
    this.selectItem(result => {
      if (result.role !== 'backdrop') {
        if (result.data.item.id === EquipmentItemId.arc) {
          this.clearWeapons();
        }
        this.items[2] = result.data.item;
      }
    });
  }

  async selectItem(setItem) {
    const popover = await this.popoverCtrl.create({
      component: SelectEquipmentItemComponent,
      componentProps: {
        items: this.items
      }
    });
    popover.onDidDismiss().then(setItem);
    return await popover.present();
  }

  onValidate() {
    this.modalCtrl.dismiss(this.items);
  }

  private clearWeapons() {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i]?.category === 'weapon') {
        this.items[i] = null;
      }
    }
  }

  equipmentComplete() {
    return this.items.filter(i => !!i).length === 3;
  }
}
