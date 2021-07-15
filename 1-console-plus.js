/*========================================
目标：
我们经常会打印一些日志来辅助调试，但是有的时候会不知道日志是在
哪个地方打印的。
希望通过 babel 能够自动在 console.log 等 api 中插入文件名和行列号
的参数，方便定位到代码。
---------------------------
思路分析：
需要做的是在遍历 AST 的时候对 console.log、console.info等api自动插入一些参数，
也就是要通过 visitor 指定对函数调用表达式CallExpression做一些处理。
(这个可以通过 astexplorer.net 来查看)
 CallExrpession 节点有两个属性，
 callee 
 arguments，
分别对应调用的函数名和参数，
所以我们要判断当 callee 是 console.xx 时，
在 arguments 的数组中中插入一个 AST 节点，
创建 AST 节点需要用到 @babel/types 包。
=========================================*/

//首先把parse、tranform、generate的框架搭好
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;

const sourceCode = `console.log("123")`;
/* module 是解析 es module 语法，script 则不解析 es module 语法，当作脚本执行，
unambiguous 则是根据内容是否有 import 和 export 来确定是否解析 es module 语法。 */
const ast = parser.parse(sourceCode,{
    sourceType:"unambiguous"
})

//遍历
traverse(ast,{
    CallExpression(path,state){



    }
})

const {code,map} = generate(ast);
console.log(code);



