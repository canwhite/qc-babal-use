var babel = require("@babel/core");

const sourceCode = "if (true) return;";
const parsedAst = babel.parseSync(sourceCode, {
  parserOpts: { allowReturnOutsideFunction: true },
});
const { code, map, ast } = babel.transformFromAstSync(
    parsedAst,
    sourceCode,
    {}//options
);
console.log("----code",code);