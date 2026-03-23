import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ErradicacionesComponent } from "./erradicaciones.component";

describe("ErradicacionesComponent", () => {
  let component: ErradicacionesComponent;
  let fixture: ComponentFixture<ErradicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErradicacionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErradicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
