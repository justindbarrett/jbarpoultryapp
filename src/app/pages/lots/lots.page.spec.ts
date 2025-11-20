import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LotsPage } from './lots.page';

describe('LotsPage', () => {
  let component: LotsPage;
  let fixture: ComponentFixture<LotsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
