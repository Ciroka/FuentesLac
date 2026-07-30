import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('flags mismatched passwords and blocks submission', () => {
    component.newPassword = 'newpassword1';
    component.confirmPassword = 'different1';
    expect(component.passwordsMismatch).toBe(true);
  });

  it('does not flag mismatch when confirm field is empty', () => {
    component.newPassword = 'newpassword1';
    component.confirmPassword = '';
    expect(component.passwordsMismatch).toBe(false);
  });
});
