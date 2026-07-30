import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Admin } from './admin';
import { environment } from '../../../environments/environment';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create and load categories, suppliers, users and audit logs on init', () => {
    httpMock.expectOne(`${environment.apiUrl}/categories?limit=1000`).flush({ items: [], total: 0, page: 1, limit: 1000 });
    httpMock.expectOne(`${environment.apiUrl}/suppliers?limit=1000`).flush({ items: [], total: 0, page: 1, limit: 1000 });
    httpMock.expectOne(`${environment.apiUrl}/users?page=1&limit=10`).flush({ items: [], total: 0, page: 1, limit: 10 });
    httpMock.expectOne(`${environment.apiUrl}/audit-logs?page=1&limit=20`).flush({ items: [], total: 0, page: 1, limit: 20 });

    expect(component).toBeTruthy();
  });
});
