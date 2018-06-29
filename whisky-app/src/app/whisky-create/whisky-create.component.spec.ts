import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiskyCreateComponent } from './whisky-create.component';

describe('WhiskyCreateComponent', () => {
  let component: WhiskyCreateComponent;
  let fixture: ComponentFixture<WhiskyCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiskyCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiskyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
