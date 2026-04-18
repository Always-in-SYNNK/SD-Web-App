import multer from 'multer';
const storage = multer.memoryStorage();

function fileFilter(req, file, cb){
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfName = file.originalname.toLowerCase().endsWith(".pdf");

    if(isPdfMime && isPdfName){
        cb(null, true);
    }else{
        cb(new Error("Only PDF CV uploads are allowed."), false);
    }
}

//Caps CV at 5 Mb
export const uploadCV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});