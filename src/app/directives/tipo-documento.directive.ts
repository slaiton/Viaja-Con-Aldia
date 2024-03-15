import { Directive, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef, Input } from '@angular/core';

@Directive({
  selector: '[appTipoDocumento]'
})
export class TipoDocumentoDirective implements OnChanges{

  @Input() appTipoDocumento: any;

  constructor(
    private templateRef: TemplateRef<any>,
    private view: ViewContainerRef

  ) { 
    this.view.createEmbeddedView(this.templateRef)
  }


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['appTipoDocumento']) {
      this.view.clear();
      this.view.createEmbeddedView(this.templateRef)
      console.log('reseteo');
       
    }
    
  }

}
