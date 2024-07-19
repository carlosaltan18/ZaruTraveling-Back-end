import multer from "multer"
import path from "path"

const upload = multer({ dest: './src/uploads' })


const ensureInvoiceFolder = () => {
    const invoiceFolderPath = './invoice';
    if (!fs.existsSync(invoiceFolderPath)) {
        fs.mkdirSync(invoiceFolderPath);
    }
}

const saveInvoice = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureInvoiceFolder(); // Asegurar que la carpeta "invoice" exista en la raíz del proyecto
        cb(null, './invoice');
    },
    filename: (req, file, cb) => {
        if (file !== null) {
            const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');

            // Agregar la extensión y la fecha para evitar errores de imágenes repetidas
            const ext = file.originalname.split('.').pop();
            const fileName = `${fileNameWithoutExt}-${Date.now()}.${ext}`;

            cb(null, fileName);
        }
    }
});
const save = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/uploads')
    },
    filename: (req, file, cb) => {
        if (file !== null) {
            const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');

            // Agregar la extensión y la fecha para evitar errores de imagenes repetidas
            const ext = file.originalname.split('.').pop();
            const fileName = `${fileNameWithoutExt}-${Date.now()}.${ext}`

            cb(null, fileName)
        }
    }
})

const filter = (res, file, cb) => {
    if (file && (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')) {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

export const validateImage = multer({ storage: save, fileFilter: filter })

const invoice = multer({ storage: saveInvoice });

export default invoice