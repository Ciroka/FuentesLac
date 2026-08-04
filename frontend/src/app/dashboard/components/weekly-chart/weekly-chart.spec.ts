import { Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseChartDirective } from 'ng2-charts';
import { WeeklyChart } from './weekly-chart';
import { ThemeService } from '../../../services/theme.service';

// jsdom no trae un canvas 2D real (no está instalado el paquete `canvas`), así que
// dejar que BaseChartDirective intente inicializar Chart.js contra un contexto nulo
// rompe en el segundo ciclo de detectChanges (el toggle de tema). Lo reemplazamos por
// un stub con la misma selector/inputs: lo que este spec verifica son los signals
// `chartData`/`chartOptions` del propio componente, no el render de Chart.js.
// eslint-disable-next-line @angular-eslint/directive-selector -- debe matchear el selector real de ng2-charts para poder reemplazarlo en el test
@Directive({ selector: 'canvas[baseChart]', standalone: true })
class StubBaseChartDirective {
  @Input() data: unknown;
  @Input() options: unknown;
  @Input() type: unknown;
}

describe('WeeklyChart', () => {
  let fixture: ComponentFixture<WeeklyChart>;
  let component: WeeklyChart;
  let themeService: ThemeService;

  beforeEach(async () => {
    // ThemeService lee localStorage al construirse — lo limpiamos para que
    // no arrastre el tema de un test anterior (mismo patrón que theme.service.spec.ts).
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    await TestBed.configureTestingModule({
      imports: [WeeklyChart],
    })
      .overrideComponent(WeeklyChart, {
        remove: { imports: [BaseChartDirective] },
        add: { imports: [StubBaseChartDirective] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WeeklyChart);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);

    // Fecha local (no toISOString(), que es UTC): el componente compara "hoy" en
    // el huso horario local, así que el fixture tiene que armar la misma fecha
    // que él espera. Con UTC, este test fallaba en cualquier huso horario negativo
    // durante la ventana en la que la fecha UTC ya rodó al día siguiente respecto
    // de la fecha local (ej. 21:00-23:59 en Argentina, UTC-3).
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    fixture.componentRef.setInput('days', [{ date: today, total: 10 }]);
    fixture.detectChanges();
  });

  it('uses the light-theme accent for the current day bar by default', () => {
    expect(component.chartData().datasets[0].backgroundColor).toEqual(['#2f6690']);
  });

  it('switches to the dark-theme accent when the theme toggles to dark', () => {
    themeService.toggle();
    fixture.detectChanges();

    expect(component.chartData().datasets[0].backgroundColor).toEqual(['#5a9ec9']);
  });
});
