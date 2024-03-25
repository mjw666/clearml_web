import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Link} from '@common/shared/components/router-tab-nav-bar/router-tab-nav-bar.component';


@Component({
  selector: 'sm-experiment-info-navbar',
  templateUrl: './experiment-info-navbar.component.html',
  styleUrls: ['./experiment-info-navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentInfoNavbarComponent {
  public baseInfoRoute: string[];
  private _minimized: boolean;

  links = [
    {name: '运行', url: ['execution']},
    {name: '配置', url: ['hyper-params', 'hyper-param', '_empty_'], activeBy: 'hyper-params'},
    {name: '制品', url: ['artifacts']},
    {name: '信息', url: ['general']},
    {name: '控制台', url: ['log'], output: true},
    {name: '标量图', url: ['metrics','scalar'], output: true},
    {name: '图表', url: ['metrics','plots'], output: true},
    {name: '调试', url: ['debugImages'], output: true},
  ] as Link[];
  @Input() set minimized(minimized: boolean) {
    this.baseInfoRoute = minimized ? ['info-output'] : [];
    this.links = this.links.map(link => ({
      ...link,
      url: (link as any).output ? this.baseInfoRoute.concat(link.url) : link.url
    }));
    this._minimized = minimized;
  }
  get minimized(){
    return this._minimized;
  }

  @Input() splitSize: number;
}
