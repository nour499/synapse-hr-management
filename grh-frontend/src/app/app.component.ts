// Angular import
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// project import
import { SpinnerComponent }       from './theme/shared/components/spinner/spinner.component';
import { ToastContainerComponent } from './theme/shared/components/toast/toast-container.component';
import { AiAssistantComponent }    from './gerai/employe/assistant/ai-assistant.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent, ToastContainerComponent, AiAssistantComponent]
})
export class AppComponent {
  title = 'SYNAPSE';
}
