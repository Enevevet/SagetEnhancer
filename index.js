const testFolder = './tex_files/';
const fs = require("fs");

fs.readdir("./tex_files/", (err, files) => {
    files.forEach(file => {


        var par = fs.readFileSync(`./tex_files/${file}`).toString('latin1');
        var header = fs.readFileSync(`./ressources/header.txt`).toString('latin1');


        par = par.replace(/\\((begin)|(end))\{frontmatter}/gm, "");
        par = par.replace(/\\documentclass(.|\n|\r)*?lineno\}/gmi, header);


        par = par.replace(/(?<=\\title{)(.*?)(?=})/g, "\\huge{\\textbf{$1}}");
        titre = par.match(/\\title(.|\r|\n)*\\author{(.|\r|\n)*?\}/gm)
        par = par.replace(/\\title(.|\r|\n)*\\author{(.|\r|\n)*?\}/gm, "")

        par = par.replace(/(?<=grad\}\}\}(\n|\r))/g, `\n\n${titre}\n\\date{}`);

        par = par.replace(/(?<=\\begin{document}(\n|\r))/gm, "\\maketitle")

        par = par.replace(/(?<=\\\\.?\n)\\fbox{\$((.|\n)*?)\$/gmis, "\\centerline{\\mathcolorbox{gray!20}{$1}")

        par = par.replace(/\\noindent /g, "");

        par = par.replace(/\$( |\n)?\$ ?= ?\$( |(\r?\n))?\$/g, " = ")

        par = par.replace(/\\textbf\{(\d\d?)(\.|\)) *((.|\r?\n?)*?)\}( |(\r?\n?))?(\\\\)?/g, "\\subsection*{$1. $3}")
        par = par.replace(/\\textbf\{([a-z])(\.|\)) *((.|\r?\n?)*?)\}( |(\r?\n?))?(\\\\)?/g, "\\subsubsection*{$1) $3}")

        par = par.replace(/ :/g, " :")

        //REPLACER DE MATHS
        function replacer(match, p1, p2, p3, p4, offset, string) {
            p2 = p2.replace(/\\overrightarrow{rot}/g, "\\rot ")
            p2 = p2.replace(/\\overrightarrow{grad}/g, "\\grad ")
            p2 = p2.replace(/div/g, "\\div")
            p2 = p2.replace(/\(/g, "\\left(")
            p2 = p2.replace(/\)/g, "\\right)")
            p2 = p2.replace(/(?<!\\[a-z]*)\[/gi, "\\left[") //Genre c'est possible mdr
            p2 = p2.replace(/(?<!\\[a-z]*\[[a-z]*)\]/gi, "\\right]") // JPP, pire arnaqueur du monde
            p2 = p2.replace(/(?<!\\([a-z]|[A-Z])*)d/gm, "\\mathrm{d}") //MATHRM D PTN
            p2 = p2.replace(/(?<!\\(([a-z]|[A-Z])*|(mathcal{)))D/gm, "\\mathrm{D}")
            p2 = p2.replace(/(?<!(\\o?i{1,3}nt|\\sum|\\product))_{(.[^}].*?)}/g, "_{\\mathrm{$2}}")
            p2 = p2.replace(/(Espace)/gi, "\\mathrm{$1}")
            p2 = p2.replace(/(Gauss)/gi, "\\mathrm{$1}")
            return `$${p2}$`;
        }
        par = par.replace(/(\$)((.|\r?\n?)*?)(\$)/gm, replacer)

        par = par.replace(/<</g, "\\ll")
        par = par.replace(/>>/g, "\\gg")


        function figreplacer(match, p1, offset, string) {
            match = match.replace(/\\begin{figure}\[[a-z]\]/g, "\n\n\\begin{wrapfigure}{r}{0.25\\textwidth}")
            match = match.replace(/\\end{figure}/g, "\\end{wrapfigure}\n\n")
            match = match.replace(/\\(begin|end){center}(\r?\n?)/g, "")
            match = match.replace(/=(.*?)\.eps/g, "=$1.PNG")
            match = match.replace(/\\caption/g, "\\caption\\protect")
            return match;
        }
        par = par.replace(/\\begin{figure}(.|\r|\n)*?\\end{figure}/g, figreplacer)
            //console.log(par.match(//g))

        //Écriture dans le fichier
        fs.writeFile(`./results/${file}`, par, (err) => {
            if (err) throw err;
        });
    });
});




//THE MOST AMAZING SHIT IN THE WORLD :
//par = par.replace(/(?<=\$(.|\r?\n?)*?)(?<!\\([a-z]|[A-Z]){1,})d(?=(.|\r?\n?)*?\$)/g, "\\mathrm{d}")
//par = par.replace(/(?<=\$(.)*?)(?<!\\([a-z]|[A-Z]){0,})d(?=(.)*?\$)/gm, "\\mathrm{d}")
//par = par.replace(/\$((.|\r?\n?)*?)(?<!\\([a-z]|[A-Z])*)d((.|\r?\n?)*?)\$/g, "$$$1\\mathrm{d}$4$$")