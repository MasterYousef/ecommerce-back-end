const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/AppError");
const path = require("path");

const ImageHandler = () => {
  const multerStorge = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new AppError("Only Images allowed", 400), false);
    }
  };
  const upload = multer({ storage: multerStorge, fileFilter: multerFilter });
  return upload;
};
exports.imageModelOptions = (options, file) => {
  const setImage = (doc) => {
    if (doc.image && !doc.image.startsWith(`http://${process.env.BASE_URL}`)) {
      const imgUrl = `http://${process.env.BASE_URL}/${file}/${doc.image}`;
      doc.image = imgUrl;
    }
    if (
      doc.imageCover &&
      !doc.imageCover.startsWith(`http://${process.env.BASE_URL}`)
    ) {
      const imgUrl = `http://${process.env.BASE_URL}/${file}/${doc.imageCover}`;
      doc.imageCover = imgUrl;
    }
    if (doc.images) {
      const data = doc.images.map((e) => {
        if (!e.startsWith(`http://${process.env.BASE_URL}`)) {
          e = `http://${process.env.BASE_URL}/${file}/${e}`;
        }
        return e;
      });
      doc.images = data;
    }
  };
  const removeImage = (doc) => {
    if (
      doc.image &&
      doc.image !== `http://${process.env.BASE_URL}/users/default_user.jpeg`
    ) {
      const image = doc.image.replace(`http://${process.env.BASE_URL}/`, "");
      fs.unlinkSync(`uploads/${image}`);
    }
    if (doc.imageCover) {
      const image = doc.imageCover.replace(
        `http://${process.env.BASE_URL}/`,
        ""
      );
      fs.unlinkSync(`uploads/${image}`);
    }
    if (doc.images) {
      doc.images.forEach((e) => {
        const image = e.replace(`http://${process.env.BASE_URL}/`, "");
        fs.unlinkSync(`uploads/${image}`);
      });
    }
  };
  options.post("init", (doc) => {
    setImage(doc);
  });
  options.post("save", (doc) => {
    setImage(doc);
  });
  options.post("findOneAndDelete", (doc) => {
    removeImage(doc);
  });
};
exports.resizeImages = async (req, res, next, name) => {
  const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
  const directory = path.join(__dirname, "..", `uploads/${name}`);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(700, 700)
      .toFormat("jpeg")
      .toFile(`uploads/${name}/${fileName}`);
    req.body.image = fileName;
  }
  next();
};
exports.resizeMultiImages = async (req, res, next, name) => {
  const directory = path.join(__dirname, "..", `uploads/${name}`);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  if (req.files.imageCover) {
    const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(700, 700)
      .toFormat("jpeg")
      .toFile(`uploads/${name}/${fileName}`);
    req.body.imageCover = fileName;
  }
  if (req.files.images) {
    const data = await Promise.all(
      req.files.images.map(async (e) => {
        const fileName = `${name}-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(e.buffer)
          .resize(700, 700)
          .toFormat("jpeg")
          .toFile(`uploads/${name}/${fileName}`);
        return fileName;
      })
    );
    if (Array.isArray(req.body.images)) {
      req.body.images = [...req.body.images, ...data];
    } else if (typeof req.body.images === "string") {
      data.push(req.body.images);
      req.body.images = data;
    }
    req.body.images = data;
  }
  next();
};
exports.SingleImageHandler = (fileName) => ImageHandler().single(fileName);
exports.MultiImagesHandler = (fieldsArray) =>
  ImageHandler().fields(fieldsArray);
