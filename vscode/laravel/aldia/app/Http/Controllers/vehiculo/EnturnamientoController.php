<?php

namespace App\Http\Controllers\vehiculo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;



class EnturnamientoController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index(Request $request)
  {
    $token = $request->header('token');
    $response = validateToken($token);

    if (!empty($request->header('user')) && !empty($request->header('password'))) {
      $response = tokenUserPass($request->header('user'), $request->header('password'));
      $token = $response['token'];
      $response = $response['code'];

      //   return $token;
    }
    if ($response != '200') {
      //  http_response_code(204);
      return response()->json([
        'data' => "Token Invalido",
        'code' => 204,
      ], 401);
    } else {

 // Verificar si se proporciona la placa y no está vacía
 if ($request->has('placa') && !empty($request->get('placa'))) {
  $vhcplaca = strtoupper($request->get('placa'));

  $turns = DB::table('enturnamiento as er')
      ->select(DB::raw('er.ntrid as Turno,er.cddnombre1 as destino1, er.cddnombre2 as destino2, er.cddnombre3 as destino3, ve.vhcplaca as placa, ci.cddnombre as origen, er.ntrdescarrosado as descarrosado,
          er.ntrejecutada as ejecutada, er.ntranulado as anulado, er.ntrautorizado as autorizado, er.ntrobservacion as observacion, er.ntrfechacreacion as fechaCreacion'))
      ->join('vehiculo as ve', 've.vhcid', '=', 'er.vhcid')
      ->join('ciudad as ci', 'ci.cddid', '=', 'er.cddid')
      ->where('er.ntrfechacreacion', '>=', '2023-09-01')
      ->where('er.ntrejecutada', '=', 'NO')
      ->where('er.ntranulado', '=', 'NO')
      ->where('ve.vhcplaca', '=', $vhcplaca)
      ->orderBy('er.ntrfechacreacion', 'DESC')
      ->limit(10)
      ->get();

  // Verificar si se encontraron resultados
  if (count($turns) == 0 ) {
      return response()->json([
          'data' => "No se encontraron resultados para la placa proporcionada",
          'code' => 204,
      ], 400);
  }

  // Prepara los resultados para la respuesta JSON
  return response()->json([
      'data' => $turns[0], // Devuelve el primer resultado
      'code' => 200,
  ]);
} else {
  return response()->json([
      'data' => "El parámetro 'placa' está vacío o no se proporcionó",
      'code' => 400, // Bad Request
  ], 400);
}
}
}

  /**
   * Show the form for creating a new resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function create()
  {
    //
  }

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    $rutarchivo =  __FILE__;
    $token = $request->header('token');
    $response = validateToken($token);

    if (!empty($request->header('user')) && !empty($request->header('password'))) {
      $response = tokenUserPass($request->header('user'), $request->header('password'));
      $token = $response['token'];
      $response = $response['code'];

      //   return $token;
    }


    if ($response != '200') {
      //  http_response_code(204);
      return response()->json([
        'data' => "Token Invalido",
        'code' => 204,
      ]);
    } else {   //DATA TOKEN ACEPTADO

      $params = $request->all();

      $user_id = DB::table("historial_token as ht")
      ->select(DB::raw("ht.sroid, g.mprid"))
      ->leftJoin('usuario as u', 'u.sroid', '=', 'ht.sroid')
      ->leftJoin('grupo as g', 'g.grpid', '=', 'u.grpid')
      ->where("ht.token", $token)
      ->get();

      $sroid = $user_id[0]->sroid;
      $empresa_id = $user_id[0]->mprid;

      // return $params['placa'];

      if (isset($params['placa']) && !empty($params['placa'])) {
        $placa = strtoupper($params['placa']);
      } else {

        return response()->json([
          'data' => "Placa Necesaria",
          'code' => 204,
        ], 400);
      }


      if ($params['ciudad_origen']) {
        $ciudad_origen = strtoupper($params['ciudad_origen']);
      } else {

        return response()->json([
          'data' => "Ciudad de Origen Necesaria",
          'code' => 204,
        ], 400);
      }



      if ($params['ciudad_destino1']) {

        $dataCiudadDestino = DB::table('ciudad');

        $ciudad_destino1 = $params['ciudad_destino1'];

        $datdestino1 = $dataCiudadDestino
          ->where('cddnombre', 'LIKE', $ciudad_destino1)
          ->get();

        if (count($datdestino1) > 0) {
          $idDatdestino1 = $datdestino1[0]->cddid;
        } else {
          $idDatdestino1 = '';
        }
      }

      if ($params['ciudad_destino2']) {

        $dataCiudadDestino = DB::table('ciudad');

        $ciudad_destino2 = $params['ciudad_destino2'];

        $datdestino2 = $dataCiudadDestino
          ->where('cddnombre', 'LIKE', $ciudad_destino2)
          ->get();

        if (count($datdestino2) > 0) {
          $idDatdestino2 = $datdestino2[0]->cddid;
        } else {
          $idDatdestino2 = '';
        }
      }

      if ($params['ciudad_destino3']) {

        $dataCiudadDestino = DB::table('ciudad');

        $ciudad_destino3 = $params['ciudad_destino3'];

        $datdestino3 = $dataCiudadDestino
          ->where('cddnombre', 'LIKE', $ciudad_destino3)
          ->get();

        if (count($datdestino3) > 0) {
          $idDatdestino3 = $datdestino3[0]->cddid;
        } else {
          $idDatdestino3 = '';
        }
      }

      if ($params['desacorasado']) {
        $ntrdescarrosado = $params['desacorasado'];
      } else {
        $ntrdescarrosado = 'NO';
      }

      if ($params['estado_trailer']) {
        $estado_trailer = $params['estado_trailer'];
      } else {
        $estado_trailer = 'null';
      }


      $datVehiculo = DB::table('vehiculo')
        ->select(DB::raw('vhcid, vhcestado'))
        ->where('vhcplaca', $placa)
        ->get();

      $dataCiudad =  DB::table('ciudad')
        ->select(DB::raw('cddid'))
        ->where('cddnombre', '=', $ciudad_origen)
        ->orderBy('cddid', 'ASC')
        ->limit(1);

      // return $query;
      $query = $dataCiudad->toSql();

      // return $query;

      $insertLog = str_replace("'", "", $query);

      // return $insertLog;

      if (count($datVehiculo) == 0) {
        return response()->json([
          'data' => "Vehiculo Invalido",
          'code' => 204,
        ], 400);
      }

      $vhcid = $datVehiculo[0]->vhcid;
      $vhcestado = $datVehiculo[0]->vhcestado;

      //Ciudad de origen


      $dataCiudad =  $dataCiudad->get();

      if (count($dataCiudad) == 0) {

        return response()->json([
          'data' => "Ciudad de Origen Invalida",
          'code' => 204,
        ], 400);
      }

      $cddid = $dataCiudad[0]->cddid;


      // Validacion Documentos

      //Validacion turno

      $dataTurno =  DB::table('enturnamiento as e')
        ->select(DB::raw('e.ntrid, e.ntrturno, e.ntrfechacreacion, e.trlid, v.vhcrigidoarticulado'))
        ->join('vehiculo as v', 'v.vhcid', '=', 'e.vhcid')
        ->where('e.vhcid', $vhcid)
        ->where('e.cddid', $cddid)
        ->where('e.ntranulado', 'NO')
        ->where('e.ntrejecutada', 'NO')
        ->orderBy('e.ntrfechacreacion', 'DESC')
        ->limit(1)
        ->get();

      if (count($dataTurno) > 0) {

        //reenturnamiento

        $ntrid = $dataTurno[0]->ntrid;
        $ntrturno = $dataTurno[0]->ntrturno;
        $trlid = $dataTurno[0]->trlid;
        $tipo_vehiculo = $dataTurno[0]->vhcrigidoarticulado;
        $ntrfechacreacion = $dataTurno[0]->ntrfechacreacion;



        $dataCapa = DB::table('vehiculo as v')
          ->select(DB::raw('v.cavhid, cc.cpccapacidad'))
          ->join('capacidadcarga as cc', 'v.cavhid', '=', 'cc.cavhid')
          ->where('v.vhcid', $vhcid);



        if ($tipo_vehiculo == 'ARTICULADO' && $trlid != '') {

          $Dataconfiguracion = DB::table('SELECT fc_configuracion_vehiculo_nuevo(' . $vhcid . ', ' . $trlid . ')  as configuracion');

          $configuracion = $Dataconfiguracion[0]->configuracion;

          $dataCapa = $dataCapa->where('cc.cpcconfiguracion', $configuracion);
        }

        $dataCapa = $dataCapa->get();

        if (count($dataCapa) > 0) {
          $capacidad =  $dataCapa[0]->cpccapacidad;
        } else {
          $capacidad = 0;
        }

        $updateTurno = DB::table('enturnamiento')
          ->where('ntrid', $ntrid)
          ->where('ntranulado', 'NO')
          ->where('ntrejecutada', 'NO')
          ->update([
            "ntrcapacidadcarga" => $capacidad,
            "ntrfechamodificacion" => date('Y-m-d H:i:s'),
          ]);

        $updateSQL = "UPDATE enturnamiento SET ntrcapacidadcarga = $capacidad, ntrfechamodificacion = " . date('Y-m-d H:i:s') . " WHERE ntrid = '$ntrid'";

        //LOG de transaccion

        $log =  logtransactionSiat('138', "Reenturnamiento", $updateSQL, $ntrid, $empresa_id, $sroid);


        return response()->json([
          'data' => "La placa digitada ya se encuentra enturnada, se reenturna con el ID de turno " . $ntrid,
          'code' => 200,
        ]);
      }

      if (count($dataTurno) == 0) {

        $dataTurno =  DB::table('enturnamiento as e')
          ->leftJoin("ciudad as cd", "cd.cddid", "=", "e.cddid")
          ->where('e.vhcid', $vhcid)
          ->where('e.ntranulado', 'NO')
          ->where('e.ntrejecutada', 'NO')
          ->orderBy('e.ntrfechacreacion', 'DESC')
          ->limit(1)
          ->get();

        if (count($dataTurno) > 0) {

          $nombre_ciudad =  $dataTurno[0]->cddnombre;
          //anulacion

          //     $consec = date('ymjHis');

          //     $insertPeticion = DB::table('historicoenturnamiento')
          //                         ->insert([
          //                             "ntrconsecutivo" => $consec,
          //                             "ntrid" => $ntrid,
          //                             "ntrturno" => $ntrturno,
          //                             "cddiddestino1" => $ciudad_destino1,
          //                             "cddiddestino2" => $ciudad_destino2,
          //                             "cddiddestino3" => $ciudad_destino3,
          //                             "ntrdisponibilidad" => 2,
          //                             "cddid" => $cddid,
          //                             "ntrfechacreacion" => $ntrfechacreacion,
          //                             "sroid" => $usuario_id,
          //                             "ntranulado" => 'SI'
          //                         ]);

          // DB::table('enturnamiento')
          // ->where('ntrid', $ntrid)
          // ->update([
          //     "ntranulado" => "SI",
          //     "camdid" => 84
          // ]);



          return response()->json([
            'data' => "Vehiculo enturnado en la ciudad: " . $nombre_ciudad,
            'code' => 200,
          ]);
        }
      }

      // creacion Turno

      $trlid = 0;
      $ntrurbano = "NO";
      $ntrinternacional = "NO";
      $ntrfechacreacion = date("Y-m-d H:i:s");
      $ntrejecutada = "NO";
      $rocrid = 'null';
      $ntrfechaejecutada = date("Y-m-d H:i:s");
      $mprid = 1;
      $ntranulado = "NO";
      $camdid = 72;
      $ntrautorizado = "NO";
      $ntrfechamodificacion = date("Y-m-d H:i:s");
      $mnfid = 0;
      $ntrprioridad1 = 1000;
      $ntrprioridad2 = 1000;
      $ntrprioridad3 = 1000;
      $ntrcapacidadcarga = '0';
      $ntrautorizadodestino1 = 'NO';
      $ntrautorizadodestino1 = 'NO';
      $ntrautorizadodestino1 = 'NO';
      $ntrobservaciondestino1 = 'null';
      $ntrobservaciondestino2 = 'null';
      $ntrobservaciondestino3 = 'null';

      //definicion de prioridad

      $ntrtipo = 0;


      $dataViajes = DB::select("SELECT tiflid,fpl_viajesvehiculo(vhcid,date '" . date("Y-m-d") . "' - integer '4','" . date("Y-m-d") . "') AS viajes FROM vehiculo WHERE vhcid=" . $vhcid);

      // return $dataViajes;

      $queryTurno = DB::select("SELECT nextconturno() as turno");

      $ntrturno = $queryTurno;

      $ntrid = consecutivo('ENTURNAMIENTO', 6, 1, 1);

      $dataInsert = [
        "ntrid" => $ntrid[0]->consecutivo,
        "ntrturno" => $ntrturno[0]->turno,
        "vhcid" => $vhcid,
        "cddiddestino1" => $idDatdestino1,
        "cddnombre1" => $ciudad_destino1,
        "cddiddestino2" => $idDatdestino2,
        "cddnombre2" => $ciudad_destino2,
        "cddiddestino3" => $idDatdestino3,
        "cddnombre3" => $ciudad_destino3,
        "ntrurbano" => $ntrurbano,
        "ntrinternacional" => $ntrinternacional,
        "ntrdescarrosado" => $ntrdescarrosado,
        "cddid" => $cddid,
        "ntrfechacreacion" => $ntrfechacreacion,
        "sroid" => $sroid,
        "ntrtipo" => $ntrtipo,
        "ntrejecutada" => $ntrejecutada,
        // "rocrid" => $rocrid,
        "ntrfechaejecutada" => $ntrfechaejecutada,
        "mprid" => $mprid,
        "ntranulado" => $ntranulado,
        "camdid" => $camdid,
        "ntrautorizado" => $ntrautorizado,
        "ntrfechamodificacion" => $ntrfechamodificacion,
        // "mnfid" => $mnfid,
        "ntrprioridad1" => $ntrprioridad1,
        "ntrprioridad2" => $ntrprioridad2,
        "ntrprioridad3" => $ntrprioridad3,
        // "trlid" => $trlid,
        "ntrcapacidadcarga" => $ntrcapacidadcarga,
        "ntrobservaciondestino1" => $ntrobservaciondestino1,
        "ntrobservaciondestino2" => $ntrobservaciondestino2,
        "ntrobservaciondestino3" => $ntrobservaciondestino3,
        "url_creacion" => $rutarchivo,
        "ntrtrailertermino" => $estado_trailer
      ];

      // return $dataInsert;


      $insertTurno = DB::table('enturnamiento')
        ->insert($dataInsert);

      $dataInsertSql = implode(',', $dataInsert);

      $insertTurnoSQL = "INSERT INTO enturnamiento VALUES ($dataInsertSql)";


      if ($insertTurno) {

        $log =  logtransactionSiat('138', "Grabar", $insertTurnoSQL, $ntrid[0]->consecutivo, $empresa_id, $sroid);


        return response()->json([
          'data' => "Vehiculo Enturnado " . $ntrid[0]->consecutivo,
          'code' => 200,
        ]);
      }
    }
  }

  /**
   * Display the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function show($id)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function edit($id)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, $id)
  {
    //
  }

  /**
   * Remove the specified resource from storage.
   *
   *
   * @param  int  $id
   * @return \Illuminate\Http\Response
   */
  public function destroy($id)
  {
    //
  }
}
