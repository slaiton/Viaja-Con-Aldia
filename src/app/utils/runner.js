addEventListener('geoSave', (resolve, reject, args) => {
  try {

    // const { lat, lon } = args;

    const data = {
      codigoTercero: "1023968660",
      lat: 79,
      lon: 10,
      ip: "198"
  };

  fetch('https://api.3slogistica.com/api/geo', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      console.log('Respuesta del servidor:', data);
  })
  .catch(error => {
      console.error('Error en la solicitud:', error);
  });


    CapacitorKV.set('foo', 'obejeto Guardado')
    resolve();
  } catch (error) {
    reject(error)
  }

});


addEventListener('geoLoad', (resolve, reject, args) => {
  try {
    const val = CapacitorKV.get('foo')
    resolve(val);
  } catch (error) {
    reject(error)
  }

});
