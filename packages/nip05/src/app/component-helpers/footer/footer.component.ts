import { Component } from '@angular/core';
import { environment } from 'packages/nip05/src/environments/environment';
import { ResponsiveService } from '../../services/responsive.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  // #region Public Properties

  year = new Date().toISOString().slice(0, 4);
  version = environment.version;

  // #endregion Public Properties

  constructor(public responsiveService: ResponsiveService) {}
}
