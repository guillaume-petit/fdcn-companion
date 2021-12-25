import {Component, Input, OnInit} from '@angular/core';
import {EquipmentItem, EquipmentItemId} from '../../../../equipment/equipment-item.model';
import {EquipmentService} from '../../../../equipment/equipment.service';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-select-equipment-item',
  templateUrl: './select-equipment-item.component.html',
  styleUrls: ['./select-equipment-item.component.scss'],
})
export class SelectEquipmentItemComponent implements OnInit {

  @Input() items: Array<EquipmentItem>;

  constructor(
    public equipmentService: EquipmentService,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {}

  isItemAvailable(item: EquipmentItem) {
    switch (item.category) {
      case 'weapon':
        return this.isWeaponAvailable(item);
      case 'support':
      case 'tool':
        return !this.isItemSelected(item) && this.items.filter(i => !!i).length < 3;
    }
  }

  isWeaponAvailable(item: EquipmentItem) {
    return !this.isItemSelected(item) &&
      !(!!this.items.find(i => i?.id === EquipmentItemId.arc) ||
      this.items.filter(i => i?.category === 'weapon').length === 2 ||
      this.items.filter(i => !!i).length === 3);
  }

  isItemSelected(item: EquipmentItem) {
    return this.items.map(i => i?.id).includes(item.id);
  }

  onSelectItem(item: EquipmentItem) {
    if (this.isItemAvailable(item)) {
      this.popoverCtrl.dismiss({
        item
      });
    }
  }

}
