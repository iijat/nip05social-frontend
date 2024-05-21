import { Component } from '@angular/core';
import { ResponsiveService } from '../../services/responsive.service';
import { ToastService } from 'packages/shared/src/lib/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
