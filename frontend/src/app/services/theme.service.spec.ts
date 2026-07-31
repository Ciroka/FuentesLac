import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light when nothing is stored and no dark preference', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('reads a previously stored theme', () => {
    localStorage.setItem('theme', 'dark');
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
  });

  it('toggle flips the theme and persists it', () => {
    const service = TestBed.inject(ThemeService);
    const initial = service.theme();
    service.toggle();
    expect(service.theme()).not.toBe(initial);
    expect(localStorage.getItem('theme')).toBe(service.theme());
  });
});
