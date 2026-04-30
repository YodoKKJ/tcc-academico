package com.tcc.academico.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Redireciona rotas do React Router para index.html.
 * Qualquer path sem extensão que não seja /api/** cai aqui.
 */
@Controller
public class SpaController {

    @GetMapping(value = {
        "/",
        "/alunos", "/professores", "/series", "/turmas", "/materias",
        "/vinculos", "/avaliacoes", "/notas", "/chamada", "/boletim"
    })
    public String spa() {
        return "forward:/index.html";
    }
}
