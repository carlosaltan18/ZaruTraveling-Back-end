import Additionals from '../additionals/additionals.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'test good' })
}
export const addAdditionalDefault = async (req, res) =>{
    try {
        let  additionalExist = await Additionals.findOne({description: 'Default'})
        if (!additionalExist) {
            let newAdditional = new Additionals({
                description: 'Default',
                price: '0',
              });
            let additionl = new Additionals(newAdditional)
            await additionl.save()
            console.log('Additional register correctly ');
            } else {
            console.log('Alredy exist Additional.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Additional')
        
    }
}

export const add = async (req, res) => {
    try {
        let data = req.body;

        // Verifica si ya existe un registro con la misma descripción
        let existingDato = await Additionals.findOne({ description: data.description });
        if (existingDato) {
            return res.status(400).send({ message: 'Data with this description already exists' });
        }

        // Crea una nueva instancia del modelo Additional con los datos proporcionados
        let newData = new Additionals(data);

        // Guarda el nuevo dato en la base de datos
        await newData.save();

        return res.send({ message: 'A new data was created' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Saving error' });
    }
};

export const update = async (req, res) => {
    try {
        let { id } = req.params; // Obtén el ID del dato a actualizar
        let newData = req.body; // Obtén los nuevos datos del cuerpo de la solicitud

        // Verifica si hay campos vacíos en los nuevos datos
        if (!newData.description || !newData.price) {
            return res.status(400).send({ message: 'Description and price are required' });
        }

        // Busca el dato por su ID en la base de datos
        let datoExistente = await Additionals.findById(id);
        if (!datoExistente) {
            return res.status(404).send({ message: 'Data not found' });
        }

        // Actualiza los campos del dato existente con los nuevos datos
        Object.assign(datoExistente, newData);

        // Guarda el dato actualizado en la base de datos
        await datoExistente.save();

        return res.send({ message: 'Data updated successfully', data: datoExistente });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Update error' });
    }
};

export const find = async (req, res) => {
    try {
        let data = await Additionals.find()
        return res.send({data})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'the information cannot be brought' })
    }
}

export const deleted = async (req, res) => {
    try {
      const { id } = req.params; // Obtén el ID del dato a eliminar
  
      // Busca el dato por su ID en la base de datos
      const datoExistente = await Additionals.findById(id);
      if (!datoExistente) {
        return res.status(404).send({ message: 'Data not found' });
      }
  
      // Elimina el dato de la base de datos
      await Additionals.findByIdAndDelete(id);
  
      // Retorna un mensaje indicando que el dato fue eliminado exitosamente
      return res.send({ message: 'Data deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Delete error' });
    }
  };

  export const getAdditionals = async (req, res) => {
    try {
        let additionals = await Additionals.find()
        return res.send({ additionals })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error fetching additionals', err: err })
    }
}