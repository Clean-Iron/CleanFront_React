const clientes = [
    {
      document: 12345678,
      typeDoc: "NIT",
      name: "Carlos Andrés",
      surname: "Castañeda Lozano",
      phone: "612345678",
      email: "car.castaneda27@gmail.com",
      addressResidence: "Calle Mayor 15, 3B",
      city: "Barranquilla",
      addresses: [
        { id: 1, street: "Calle Mayor 15, 3B", city: "Madrid", type: "Residencia" },
        { id: 2, street: "Polígono Industrial Norte, Nave 7", city: "Madrid", type: "Trabajo" }
      ]
    },
    {
      document: 1000318916,
      typeDoc: "CC",
      name: "Daniel Felipe",
      surname: "Rojas Hernández",
      phone: "3015608604",
      email: "dani.07rojas94@gmail.com",
      addressResidence: "Av. Diagonal 213, 5A",
      city: "Barcelona",
      addresses: [
        { id: 3, street: "Av. Diagonal 213, 5A", city: "Barcelona", type: "Residencia" }
      ]
    },
    {
      document: 34567890,
      typeDoc: "CC",
      name: "Carlos",
      surname: "Ruiz",
      phone: "634567890",
      email: "carlos@diseñoscr.com",
      addressResidence: "Plaza del Ayuntamiento 4, 2C",
      city: "Valencia",
      addresses: [
        { id: 4, street: "Plaza del Ayuntamiento 4, 2C", city: "Valencia", type: "Residencia" },
        { id: 5, street: "Calle Colón 76, Local 2", city: "Valencia", type: "Trabajo" },
        { id: 6, street: "Calle Serrano 25", city: "Madrid", type: "Secundaria" },
        { id: 7, street: "Calle Serrano 25", city: "Madrid", type: "Secundaria" },
        { id: 8, street: "Calle Serrano 25", city: "Madrid", type: "Secundaria" },
        { id: 9, street: "Calle Serrano 25", city: "Madrid", type: "Secundaria" },
      ]
    },
    {
      document: 45678901,
      typeDoc: "CC",
      name: "Ana",
      surname: "Martínez",
      phone: "645678901",
      email: "ana.martinez@outlook.com",
      addressResidence: "Av. de la Constitución 32, 7D",
      city: "Sevilla",
      addresses: [
        { id: 7, street: "Av. de la Constitución 32, 7D", city: "Sevilla", type: "Residencia" }
      ]
    },
    {
      document: 56789012,
      typeDoc: "CC",
      name: "Pablo",
      surname: "Sánchez",
      phone: "656789012",
      email: "pablo@innovaplus.com",
      addressResidence: "Gran Vía 45, 8B",
      city: "Bilbao",
      addresses: [
        { id: 8, street: "Gran Vía 45, 8B", city: "Bilbao", type: "Residencia" },
        { id: 9, street: "Parque Tecnológico, Edificio 3", city: "Bilbao", type: "Trabajo" }
      ]
    }
  ];
  
  export default clientes;
  