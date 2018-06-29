import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiskyHomeComponent } from './whisky-home.component';

describe('WhiskyHomeComponent', () => {
  let component: WhiskyHomeComponent;
  let fixture: ComponentFixture<WhiskyHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiskyHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiskyHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
