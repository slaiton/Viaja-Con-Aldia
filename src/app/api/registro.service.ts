import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs-compat/Observable";

@Injectable({
  providedIn: 'root'
})
export class RegistroService {


 constructor(private http: HttpClient) { }

getDataCode(cedula:any, placa:any, token:any): Promise<any>
{
  const params = new HttpParams({
    fromString: 'cedula=' + cedula + '&placa=' + placa
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

  const requestOptions = { headers: headers, params: params };
  return this.http.get("https://api.3slogistica.com/api/vehiculo/validation", requestOptions).toPromise();
}

sendCode(json:any, token:any): Promise<any>
{
  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

  const requestOptions = { headers: headers };
  return this.http.post("https://api.3slogistica.com/api/vehiculo/validation", json, requestOptions).toPromise();
}

validateCode(json:any, token:any): Promise<any>
{
  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

  const requestOptions = { headers: headers };
  return this.http.put("https://api.3slogistica.com/api/vehiculo/validation", json, requestOptions).toPromise();
}

sendDataTercero(json:any): Promise<any>
{
  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8'
  });

  const requestOptions = { headers: headers };

  return this.http.post("https://api.3slogistica.com/api/tercero", json, requestOptions).toPromise();
}

addVehiclexDriver(token:any, json:any): Promise<any> {

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });


  const requestOptions = { headers: headers };

  return this.http.post("https://api.3slogistica.com/api/mis-vehiculos", json, requestOptions).toPromise();
}


deleteVehicle(params:any, token:any):Observable<any> {

  const headers = new HttpHeaders({
    'Content-Type':'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

  const requestOptions = { headers: headers, body: params };


  return this.http.delete("https://api.3slogistica.com/api/mis-vehiculos/1", requestOptions)
}


getDataTercero(cedula:any): Observable<any>
{
  const params = new HttpParams({
    fromString: 'cedula=' + cedula
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json'
  });

  const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.3slogistica.com/api/tercero", requestOptions)
}


sendDataVehiculo(json:any): Promise<any>
{
  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8'
  });

  const requestOptions = { headers: headers };

  return this.http.post("https://api.3slogistica.com/api/vehiculo", json, requestOptions).toPromise();
}

changeDataVehicle(json:any, token:any): Promise<any>
{
  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

  const requestOptions = { headers: headers };

  return this.http.post("https://api.3slogistica.com/api/vehiculo/change", json, requestOptions).toPromise()
}



getDataVehiculo(placa:any): Observable<any>
{
  const params = new HttpParams({
    fromString: 'placa=' + placa
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json'
  });

  const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.3slogistica.com/api/vehiculo", requestOptions)
}

getSatelital(token:any) : Observable<any>{

  const params = new HttpParams({
    fromString: 'estado=1'
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.3slogistica.com/api/satelital", requestOptions)
}


 getClasevehiculo(token:any) : Observable<any>{

    const params = new HttpParams({
      fromString: 'estado=1'
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

  const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/clasevehiculo", requestOptions)
 }

 getMarcas(token:any)  : Observable<any>{
    const params = new HttpParams({
        fromString: ''
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });

    const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.3slogistica.com/api/marcavehiculo", requestOptions)
 }

 getVehiculos(placa:any, cedula:any, token:any)  : Observable<any>{
  const params = new HttpParams({
      fromString: 'cedula='+ cedula + '&placa='+placa
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

  const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/mis-vehiculos", requestOptions)
}

 getCarrocerias(clase:any, token:any)  : Observable<any>{
    const params = new HttpParams({
        fromString: 'clase='+ clase
      });

      const headers = new HttpHeaders({
        'Content-Type':'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      });

    const requestOptions = { headers: headers, params: params };

      return this.http.get("https://api.3slogistica.com/api/carroceriavehiculo", requestOptions)
 }

 getLineas(marca:any, linea:any, token:any)  : Observable<any>{
  const params = new HttpParams({
      fromString: 'codigoMarca='+ marca + '&codigoLinea' + linea
    });

    const headers = new HttpHeaders({
      'Content-Type':'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    });

  const requestOptions = { headers: headers, params: params };

    return this.http.get("https://api.3slogistica.com/api/claselinea", requestOptions)
}
getColores(token:any)  : Observable<any>{

  const params = new HttpParams({
    fromString: 'estado=1'
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.3slogistica.com/api/color", requestOptions)
}

getParent(token:any)  : Observable<any>{

  const params = new HttpParams({
    fromString: 'estado=1'
  });

  const headers = new HttpHeaders({
    'Content-Type':'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  });

const requestOptions = { headers: headers, params: params };

  return this.http.get("https://api.3slogistica.com/api/parentes", requestOptions)
}


 getTermGeneral() {

  const container = document.getElementById('dataTerms');

  const title = document.createElement('h5');
  title.innerHTML = ' 1.	DECLARACIÓN SOBRE ORIGEN DE FONDOS/ SISTEMA INTEGRAL PARA LA PREVENCION DEL LAVADO DE ACTIVOS Y LA FINANCIACION DEL TERRORISMO Y PROLIFERACION DE ARMAS DE DESTRUCCION MASIVA ';
  container?.appendChild(title)

  const content = document.createElement('p');
  content.innerHTML = 'Conozco, entiendo y acepto de manera voluntaria e inequívoca el cumplimiento de la regulación vigente y de acuerdo a lo establecido en la circular 0170 de 2002 de la Dirección de Impuestos y Aduanas Nacionales (DIAN), Resolución 74854/2016, Decreto 1165 /2019 y  demás normas que lo modifiquen o adicionen, bajo gravedad de juramento que los recursos que entrego, no provienen de ninguna actividad ilícita de las contempladas en el código penal colombiano y no admitiré que terceros efectúen depósitos a mis productos con recursos provenientes de actividades ilícitas ni efectuare transacciones destinadas a tales actividades ni a favor de personas relacionadas con las mismas, declaro expresamente lo siguiente:'
  container?.appendChild(content)


  const content1 = document.createElement('p');
  content1.innerHTML = '1.La información suministrada en el presente documento es veraz y verificable y la persona natural o jurídica se compromete a actualizarla anualmente. <br> 2. Los recursos que se deriven de la actividad, profesión u oficio de la persona natural o jurídica, no se destinarán a la financiación del terrorismo, grupos terroristas o actividades terroristas y a la proliferación de armas de destrucción masiva. <br> 3. Los recursos que posee la persona natural o jurídica provienen de su actividad, profesión u oficio y/o objeto social. <br> 4.Todos los pagos que realizo (realizamos) son directos, con recursos propios, no a través de terceros, ni con recursos de terceros. <br> 5. De manera irrevocable autorizo (autorizamos) a la compañía para solicitar, consultar, procesar, suministrar, reportar o divulgar a cualquier entidad válidamente autorizada para manejar o administrar bases de datos, incluidas las entidades gubernamentales, información contenida en este formulario y demás. ';
  container?.appendChild(content1)



  const title2 = document.createElement('h5');
  title2.innerHTML = '2.	AUTORIZACION DE CONSULTA Y REPORTE ACENTRALES DE RIESGO'
  container?.appendChild(title2)

  const container2 = document.createElement('p');
  container2.innerHTML = 'Las partes acuerdan que cualquier información intercambiada, facilitada o creada entre las partes, durante el desarrollo de sus negocios y/o los que se llegaren a ejecutar, será mantenida en estricta confidencialidad. Por lo tanto las partes se obligan a no revelar, divulgar, exhibir, mostrar, trasmitir, modificar, ceder, copiar y/o comunicar la Información que reciba de la otra parte, a persona jurídica o natural alguna, ni a utilizarla en su favor o en el de terceros, y en consecuencia deberá mantenerla de manera confidencial y privada y a proteger dicha información para evitar su divulgación no autorizada, ejerciendo sobre ésta el mismo grado de diligencia que utiliza para proteger información confidencial de su propiedad. La información podrá estar contenida en cualquier medio o forma, tangible o intangible. La parte receptora correspondiente solo podrá revelar la información al personal que la requiera para el cumplimiento de las actividades propias del negocio y para la prestación del servicio, debiendo garantizar la debida reserva y confidencialidad. En caso de verificarse y demostrarse el incumplimiento de este pacto, la parte afectada podrá iniciar las acciones legales a que haya lugar y solicitar la indemnización de perjuicios correspondiente.'
  container?.appendChild(container2)


  const title3 = document.createElement('h5');
  title3.innerHTML = '3.	CONFIDENCIALIDAD'
  container?.appendChild(title3)

  const container3 = document.createElement('p');
  container3.innerHTML = 'Las partes acuerdan que cualquier información intercambiada, facilitada o creada entre las partes, durante el desarrollo de sus negocios y/o los que se llegaren a ejecutar, será mantenida en estricta confidencialidad. Por lo tanto las partes se obligan a no revelar, divulgar, exhibir, mostrar, trasmitir, modificar, ceder, copiar y/o comunicar la Información que reciba de la otra parte, a persona jurídica o natural alguna, ni a utilizarla en su favor o en el de terceros, y en consecuencia deberá mantenerla de manera confidencial y privada y a proteger dicha información para evitar su divulgación no autorizada, ejerciendo sobre ésta el mismo grado de diligencia que utiliza para proteger información confidencial de su propiedad. La información podrá estar contenida en cualquier medio o forma, tangible o intangible. La parte receptora correspondiente solo podrá revelar la información al personal que la requiera para el cumplimiento de las actividades propias del negocio y para la prestación del servicio, debiendo garantizar la debida reserva y confidencialidad. En caso de verificarse y demostrarse el incumplimiento de este pacto, la parte afectada podrá iniciar las acciones legales a que haya lugar y solicitar la indemnización de perjuicios correspondiente.'
  container?.appendChild(container3)



  const title4 = document.createElement('h5');
  title4.innerHTML = '4.	DECLARACION CONOCIMIENTO DEL PROGRMA DE ETICA Y TRASNPARENCIA EMPRESARIAL'
  container?.appendChild(title4)

  const container4 = document.createElement('p');
  container4.innerHTML = 'Como asociado de negocios declaro conocer el Programa de ética y transparencia empresarial el cual se encuentra publicado en la página web. www.aldialogistiica.com el cual tiene como premisas y objetivos: <br> 1.	Cumplir las reglas de la compañía y procedimientos <br> 2.	Cumplir la legislación aplicable a la organización <br> 3.	Nunca ofrecer o tomar un soborno <br> 4.	Evitar cualquier conflicto de interés <br> 5.	Mostrar respeto por los demás. <br> 6.	Evitar todo hecho, tentativa u omisión deliberada para obtener un beneficio para sí o para terceros en detrimento de los principios organizacionales. <br> 7.	Cumplir con las normas de salud, la seguridad y el medio ambiente. '
  container?.appendChild(container4)




  const title5 = document.createElement('h5');
  title5.innerHTML = '5.	ACEPTACIÓN ROLES Y RESPONSABILIDADES SGI / MANIFESTACION SUSCRITA'
  container?.appendChild(title5)

  const container5 = document.createElement('p');
  container5.innerHTML = '-	Suministrar los documentos necesarios dentro del proceso de registro para ser avalado como conductor tercero. <br> -	Informar al área de registro de vehículos y tráfico el usuario y clave de su GPS (satelital) y activar el botón de pánico no solo en casos de emergencia sino cuando sea detenido por un retén policial o del ejército. <br> -	Cumplir las recomendaciones dadas por las áreas de gestión integral y trafico respetando las normas de seguridad establecidas por la organización. <br> -	Salir a ruta en la fecha y hora informada. Se PROHIBE llevar acompañantes dentro de los vehículos.  <br> -	Velar por el cuidado y seguridad de la mercancía transportada e informar al área de tráfico cualquier novedad como (faltantes, sobrantes, averías, entre otros). <br> -	No debe lavar, ni realizar arreglos al vehículo durante el tránsito, ni hacer diligencias personales o realizar detenciones o desvíos de ruta no autorizados. Pernoctar únicamente en los lugares autorizados. <br> -	El asociado de negocio debe verificar que su vehículo sea precintado por el cliente o la empresa transportadora, los números de los precintos y/o sellos deben coincidir con los relacionados en los documentos. Durante el transito debe revisar que los precintos o sellos no sean vulnerados para que la mercancía no sea afectada, en caso de observar alguna novedad debe informar al área de tráfico. Si por alguna razón las autoridades de carretera le rompen o cambian el precinto o sello, solicite que le pongan la nota en la REMESA TERRESTRE DE CARGA e informe al área de tráfico. <br> -	Entregar la mercancía únicamente en la dirección relacionada en la remesa, elaborada por el auxiliar de operaciones. Debe reportar e informar al área de tráfico Bogotá la entrega de la mercancía al cliente y cualquier novedad (faltantes, averías, sobrantes etc.) que se presente en la entrega. <br> -	Para retirar un contenedor del patio, presentar la orden de cargue expedida por el auxiliar de operaciones (Si aplica). <br> -	Conocer los riesgos de Seguridad y Salud en el Trabajo y los viales de acuerdo al rol de actor vial que aplique en sus actividades <br> -	Cumplir con la legislación de tránsito y transporte, así como de los lineamientos de seguridad vial internos de la organización.  <br> -	Dar cumplimiento a las instrucciones y normas para el transporte de mercancías peligrosas, portar siempre el kit para atención de emergencias, identificar el vehículo con rótulos y la placa UN (Naciones Unidas), exigir y portar la Tarjeta de Emergencias y Hojas de Seguridad. (Si aplica). <br> -	Disponer los residuos generados en las canecas destinadas para ello.  <br> -	Garantizar el buen estado del vehículo asignado, reportando oportunamente al área de mantenimiento cualquier tipo de daño o mejora que requiera el equipo automotor.  <br> -	Hacer el Preoperacional para garantizar su seguridad, la de todos los usuarios de la vía y el buen estado del vehículo asignado. <br> -	Hacer un buen uso de los equipos y herramientas entregadas por la empresa (Herramienta, extintor, botiquín, si transporta mercancías peligrosas el Kit para atención de emergencias) Cuando aplique. <br> -	Informar oportunamente a la empresa acerca de los peligros y riesgos latentes en su sitio de trabajo.  <br> -	La mercancía debe ser entregada únicamente en la dirección relacionada en la remesa, elaborada por el auxiliar de operaciones. <br> -	Mantener en buenas condiciones de Orden y Aseo el vehículo asignado.  <br> -	Mantener hábitos de vida saludables, consumir frutas y verduras, realizar actividad física. <br> -	No aceptar o cargar mercancía adicional durante el tránsito en la vía o sitios no autorizados o programados <br> -	No ingerir alcohol y sustancias psicoactivas que afecten el desempeño de sus funciones.  <br> -	No lavar, ni realizar arreglos al vehículo durante el tránsito, ni hacer diligencias personales o realizar detenciones. <br> -	No participar en el proceso de cargue y descargue de mercancías peligrosas salvo si está capacitado y autorizado. <br> -	Notificar cualquier novedad durante los desplazamientos laborales en carretera al área de Trafico (siniestros viales, actividades sospechosas, hurto, saqueo, derrame de producto, derrumbe, volcamiento, varada, colisión, inspección de mercancía, desvíos de ruta no autorizados, aprensión de mercancía, inmovilización del vehículo, trancones en la vía, entre otros) <br> -	Participar en el cumplimiento de los planes y programas del SGI <br> -	Participar en las actividades de prevención y promoción para prevenir los ATEL y los siniestros viales <br> -	Portar prendas de dotación y elementos de protección personal según sea el caso.'
  container?.appendChild(container5)


 }

}
