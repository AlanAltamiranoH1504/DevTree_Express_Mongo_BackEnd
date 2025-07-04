import {Result, ValidationError, validationResult} from "express-validator";
import {TUsuario, TUsuarioUpdateInformacion} from "../types";
import usuario from "../models/Usuario";
import Usuario from "../models/Usuario";
import {generacionSlug} from "../utils/auth";

const pruebaUsuarioController = (req, res) => {
    res.status(200).json({
        msg: "Llegando al controlador de usuario"
    });
}

const updateInformacion = async (req, res) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(409).json({
            errors: errors.array()
        });
    }
    try {
        const usuarioEnSesion = req.usuario;
        const informacionActualizado: TUsuarioUpdateInformacion = req.body;

        //Verificacion de handle no este usuado
        const handleRegistrado = await Usuario.findOne({
            handle: generacionSlug(req.body.handle)
        });
        if (handleRegistrado && handleRegistrado.email !== usuarioEnSesion.email) {
            return res.status(409).json({
                msg: "Username ya en uso."
            });
        }

        const usuarioActualizar = await usuario.findOne({email: usuarioEnSesion.email}).select("nombre handle email descripcion");
        usuarioActualizar.handle = informacionActualizado.handle;
        usuarioActualizar.descripcion = informacionActualizado.descripcion.trim() === "" ? " " : informacionActualizado.descripcion;
        await usuarioActualizar.save();
        res.status(200).json({
            msg: "Información actualizada correctamente.",
        });
    } catch (e) {
        return res.status(500).json({
            error: "Error en actualizacion de informacion de usuario.",
            message: e.message
        })
    }
}

const updateLinksUser = async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(409).json({
            errores: errores.array()
        });
    }
    try {
        const userInSession = req.usuario;
        const {links} = req.body;
        const usuarioToUpdate = await Usuario.findOneAndUpdate({
            email: userInSession.email
        }, {
            $set: {
                links: JSON.stringify(links)
            }
        });
        usuarioToUpdate.save();
        return res.status(200).json({
            msg: "Link actualizado correctamente.",
        })
    } catch (e) {
        return res.status(500).json({
            error: "Error en la actualizacion de link del usuario.",
            message: e.message
        });
    }
}

const informacionDePerfilPublica = async (req, res) => {
    try {
        const handle = req.params.handle;
        //Busqueda de usuario con ese handle
        const findUser = await Usuario.findOne({
            handle: handle
        }).select("-_id nombre handle descripcion urlImagen links");

        //Error de handle no encontrado
        if (!findUser) {
            return res.status(400).json({
                msg: `Usuario con handle ${handle} no registrado.`
            });
        }
        return res.status(200).json(findUser);
    } catch (e) {
        return res.status(500).json({
            error: "Error en la busqueda de usuario con handle: ",
            message: e.message
        });
    }
}

const handleRegistrado = async (req, res) => {
    const errores:  Result<ValidationError> = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(409).json({
            errores: errores.array()
        });
    }
    try {
        const handle: string = req.body.handle;
        //Busqueda de usuario registrado con ese handle
        const handleRegistrado = await Usuario.findOne({
            handle: handle
        });
        if (handleRegistrado) {
            return res.status(409).json({
                error: "Handle ya registrado."
            });
        }
        return res.status(200).json({
            msg: "Handle disponible para su uso."
        })
    }catch (e) {
        return res.status(500).json({
            error: "Error en la busqueda de handle registrado.",
            message: e.message
        });
    }
}

export {
    pruebaUsuarioController,
    updateInformacion,
    updateLinksUser,
    informacionDePerfilPublica,
    handleRegistrado
}