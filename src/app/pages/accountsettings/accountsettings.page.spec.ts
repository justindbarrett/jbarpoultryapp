import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSettingsPage } from './accountsettings.page';

describe('AccountSettingsPage', () => {
  let component: AccountSettingsPage;
  let fixture: ComponentFixture<AccountSettingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
