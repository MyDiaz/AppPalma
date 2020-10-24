import { Component } from '@angular/core';
import { EnfermedadesService } from '../../Servicios/enfermedades.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listado-enfermedades',
  templateUrl: './listado-enfermedades.component.html',
  styles: []
})
export class ListadoEnfermedadesComponent {
  
  NombreEnfermedadForm:FormGroup;
  EtapaEnfermedadForm:FormGroup;

  enfermedadesEtapas:any = [];
  unique_enfermedades:any = [];
  contador_etapas_enfermedad:any = [2,2,1,1];
  enfermedades:any = [];
  
  NombreEnfermedadEditar:string;
  bandera:boolean = false;
  mensaje_error:string;
  
  constructor(private EnfermedadesService:EnfermedadesService, private router:Router,
    private activatedRoute:ActivatedRoute) {
    
    this.EnfermedadesService.getEnfermedadesEtapas().subscribe( data => {
      this.enfermedadesEtapas = this.groupBy(data,"nombre_enfermedad");
      console.log("hola", this.enfermedadesEtapas);
    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensaje_error = "Servicio no disponible"
    })    

    this.EnfermedadesService.getEnfermedades().subscribe( data => {
      this.enfermedades = data;

    }, err => {
      this.bandera = true;
      this.mensaje_error = err.error.mensaje;
      console.log(err);
      if( err.status == 0 ) this.mensaje_error = "Servicio no disponible"
    })

    this.NombreEnfermedadForm = new FormGroup({
      nombre_enfermedad: new FormControl()
    })
    
    this.EtapaEnfermedadForm = new FormGroup({
      id_enfermedad: new FormControl()
    })
    //this.mostrarEnfermedadesEtapas();
  }
  

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  /*mostrarEnfermedadesEtapas(){
    console.log("enfermedadesEtapas", this.enfermedadesEtapas);
    for(let i = 0; i<this.enfermedadesEtapas.length; i++){
      this.unique_enfermedades.push(this.enfermedadesEtapas[i].nombre_enfermedad);
    }
    var unique = this.unique_enfermedades.filter(this.onlyUnique);

    for(let i = 0; i<unique.length; i++){
    //[pudricion cogollo,pudricion,enfermedades]
        let contador = 0;
        for(let j = 0; j<this.unique_enfermedades.length; j++){
    //[pudricion cogollo,pudricion cogollo,pudricion,pudricion,enfermedades,enfermedades]
            if( unique[i] === this.unique_enfermedades[j] ){
                    contador = contador+1;    
            }
        }
        this.contador_etapas_enfermedad.push(contador);
    }
    console.log("contador_etapas_enfermedad", this.contador_etapas_enfermedad);
    //return this.unique_enfermedades, this.contador_etapas_enfermedad; 
    //[pudricion cogollo,pudricion,enfermedades,beto], [2,2,1,1]
  }*/

  enviarEnfermedad(){
    console.log("this.NombreEnfermedadForm.value", this.NombreEnfermedadForm.value);
    console.log("EtapaEnfermedadForm", this.EtapaEnfermedadForm.value);
  }

  editarEnfermedad(){
    if(this.NombreEnfermedadForm.value.nombre_enfermedad.startsWith("enfermedad-")){
      this.router.navigate(['editar-enfermedad',this.NombreEnfermedadForm.value.nombre_enfermedad.replace("enfermedad-", "")]);
    }
    else{
      this.router.navigate(['editar-etapa-enfermedad',this.NombreEnfermedadForm.value.nombre_enfermedad.replace("etapa-", "")]);
    }
  }

  private groupBy(collection, property){
    var i = 0, val, index,
        values = [], result = [];
    for (; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
}
}