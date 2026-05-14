import mongoose from "mongoose";
import ErroBase from "../erros/ErroBase.js";
import RequisicaoIncorreta from "../erros/RequisicaoIncorreta.js";
import ErroValidacao from "../erros/ErroValidacao.js";
import NaoEncontrado from "../erros/NaoEncontrado.js";


function manipuladorDeErros(error, req, res, next){
    if(error instanceof mongoose.Error.CastError){
        return new RequisicaoIncorreta().enviarResposta(res)
    }else if(error instanceof mongoose.Error.ValidationError){
        return new ErroValidacao(error).enviarResposta(res)
    }else if(error instanceof NaoEncontrado){
        return error.enviarResposta(res);
    }else{
        return new ErroBase().enviarResposta(res);
    }
}

export default manipuladorDeErros