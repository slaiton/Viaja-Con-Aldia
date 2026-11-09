import { TemplateRef, ViewContainerRef } from '@angular/core';
import { TipoDocumentoDirective } from './tipo-documento.directive';

describe('TipoDocumentoDirective', () => {
  it('should create an instance', () => {
    const templateRefSpy = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    const viewContainerRefSpy = jasmine.createSpyObj('ViewContainerRef', ['createEmbeddedView', 'clear']);
    const directive = new TipoDocumentoDirective(templateRefSpy, viewContainerRefSpy);
    expect(directive).toBeTruthy();
  });
});
