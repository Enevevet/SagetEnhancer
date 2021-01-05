const testFolder = './tex_files/';
const latex = require('node-latex')
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

        par = par.replace(/\\noindent /g, "");

        par = par.replace(/\$( |\n)?\$ ?= ?\$( |(\r?\n))?\$/g, " = ")

        par = par.replace(/\\textbf\{(\d\d?)(\.|\)) *((.|\r?\n?)*?)\}( |(\r?\n?))?(\\\\)?/g, "\\subsection*{$1. $3}")
        par = par.replace(/\\textbf\{([a-z])(\.|\)) *((.|\r?\n?)*?)\}( |(\r?\n?))?(\\\\)?/g, "\\subsubsection*{$1) $3}")

        par = par.replace(/ :/g, " :")
        par = par.replace(/\$\\times\$ désigne/g, "$$\\wedge$$ désigne")

        function parenth(str) {
            let L = []
            let Ltemp = []
            for (let k = 0; k < str.length; k++) {
                let element = str[k];
                switch (element) {
                    case '(':
                        Ltemp.push(k)
                        break;

                    case ')':
                        L.push([Ltemp.pop(), k])
                        break;

                    default:
                        break;
                }

            }

            L.forEach(element => {
                let a = element[0];
                let b = element[1];

                if (a - b > 4) {
                    str = str.substring(0, a) + "\\left(" + substring(a + 1)
                    str = str.substring(0, b) + "\\right)" + substring(b + 1)
                }
            });
            return str
        }

        //REPLACER DE MATHS
        function replacer(match, p1, p2, p3, p4, p5, offset, string) {
            p3 = p3.replace(/\\overrightarrow{rot}/g, "\\rot ")
            p3 = p3.replace(/\\overrightarrow{grad}/g, "\\grad ")
            p3 = p3.replace(/div/g, "\\div")
                //p3 = p3.replace(/\(([^)]{5,}?)\)/g, "\\left($1\\right)")
            p3 = parenth(p3)
                //p3 = p3.replace(/(?<!\\[a-z]*)\[/gi, "\\left[") //Genre c'est possible mdr
                //p3 = p3.replace(/(?<!(?!\\left)\\[a-z]*\[[a-z]*)\]/gi, "\\right]") // JPP, pire arnaqueur du monde
            p3 = p3.replace(/\[/gi, "\\left[")
            p3 = p3.replace(/\]/gi, "\\right]")
            p3 = p3.replace(/(?<!(\\o?i{1,3}nt|\\sum|\\product))_{(.[^}].*?)}/gs, "_{\\mathrm{$2}}")
            p3 = p3.replace(/(Espace)/gi, "\\mathrm{$1}")
            p3 = p3.replace(/(Gauss)/gi, "\\mathrm{$1}")
            p3 = p3.replace(/(?<!\\([a-z]|[A-Z])*)(?<!\\text\{(\w| )*)d/gm, "\\mathrm{d}") //MATHRM D PTN
            p3 = p3.replace(/(?<!\\(([a-z]|[A-Z])*|(mathcal{)))D/gm, "\\mathrm{D}")
            p3 = p3.replace(/(?<!\w)(cte|cste)/g, "\\mathrm{$1}")
            p3 = p3.replace(/\\times( |\r?\n?)\\overrightarrow/g, "\\wedge \\overrightarrow")
            if (p2 == undefined) {
                p2 = ""
            }

            return `${p1}${p2}${p3}${p5}`;
        }

        par = par.replace(/(\$)()((.|\r?\n?)*?)(\$)/gm, replacer)
        par = par.replace(/(\\begin{eqnarray})(\\label{.*?})?((.|\r?\n?)*?)(\\end{eqnarray})/g, replacer)
            //par = par.replace(/(\\mathcolorbox{.*?}{)()((.|\r?\n?)*?)(}\.( |\n?\r?))/g, replacer)

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

        par = par.replace(/(?<=\\\\.?\n)\\fbox{\$((.|\n)*?)\$/gmis, "\\centerline{\\mathcolorbox{gray!20}{$1}")
        par = par.replace(/\\fbox{\$((.|\n|\r)*?)\$/gims, "\\mathcolorbox{gray!20}{$1")

        //Écriture dans le fichier
        fs.writeFile(`./tex_results/${file}`, par, (err) => {
            if (err) throw err;
        });

        console.log("Compilation de " + file)

        var input = fs.createReadStream(`./tex_results/${file}`)
        var output = fs.createWriteStream(`./pdf_preview/preview_${file}.pdf`)

        const options = {
            errorLogs: 'latexerrorsa.log', // This will write the errors to `latexerrors.log`
            inputs: './assets/'
        }

        latex(input, options).pipe(output)
    });
});




//THE MOST AMAZING SHIT IN THE WORLD :
//par = par.replace(/(?<=\$(.|\r?\n?)*?)(?<!\\([a-z]|[A-Z]){1,})d(?=(.|\r?\n?)*?\$)/g, "\\mathrm{d}")
//par = par.replace(/(?<=\$(.)*?)(?<!\\([a-z]|[A-Z]){0,})d(?=(.)*?\$)/gm, "\\mathrm{d}")
//par = par.replace(/\$((.|\r?\n?)*?)(?<!\\([a-z]|[A-Z])*)d((.|\r?\n?)*?)\$/g, "$$$1\\mathrm{d}$4$$").