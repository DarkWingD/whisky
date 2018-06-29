import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiskyEditComponent } from './whisky-edit.component';

describe('WhiskyEditComponent', () => {
  let component: WhiskyEditComponent;
  let fixture: ComponentFixture<WhiskyEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiskyEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiskyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
