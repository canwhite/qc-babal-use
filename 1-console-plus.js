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
//（因为 @babel/parser 等包都是通过 es module 导出的，所以通过 commonjs 的方式引入有的时候要取 default 属性。）
const generate = require("@babel/generator").default;
const types = require('@babel/types');
const template = require('@babel/template').default;


//version4需要从core里边拿一个transformFromAstSync
const { transformFromAstSync } = require('@babel/core');
const insertParametersPlugin = require('./plugin/1-console-plugin');
const fs = require('fs');
const path = require('path');
/* 
module 是解析 es module 语法，script 则不解析 es module 语法，当作脚本执行，
unambiguous 则是根据内容是否有 import 和 export 来确定是否解析 es module 语法。 
上边sourceCode里render了组件，用到了jsx的语法，所以
parse的时候我们要加上jsx的解析
*/
/* const ast = parser.parse(sourceCode,{
    sourceType:"unambiguous",
    plugins:['jsx']
})
 */
//当是 console.xxx 的 AST 时，在参数中插入文件名和行列号，行列号从 AST 的公共属性 loc 上取。


//version1
/* traverse(ast, {
    CallExpression (path, state) {
        if ( types.isMemberExpression(path.node.callee) 
            && path.node.callee.object.name === 'console' 
            && ['log', 'info', 'error', 'debug'].includes(path.node.callee.property.name) 
           ) {
            const { line, column } = path.node.loc.start;
            path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
        }
    }
}); */


//version2
/* const targetCalleeName = ['log','info','error','debug'].map(item=>`console.${item}`);
traverse(ast,{
    CallExpression(path,state){
        //const calleeName = generate(path.node.callee).code; 
        //更精简的方式是调用 path.get('callee').toString()
        //path.get、path.set 获取和设置当前节点属性的 path
        //整体情况是，可以通过path获取自己想要的任何节点，然后可以通过types或者template操作
        const calleeName = path.get("callee").toString();

        if(targetCalleeName.includes(calleeName)){
            //拿到line和column
            const {line,column} = path.node.loc.start;
            //在参数的首部加上我们想要添加的信息,types库特别适合这种单个添加
            path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
        }
    }
})
 */
//version3
/* ================================================================================
后来我们觉得在同一行打印会影响原本的参数的展示，所以想改为在 console.xx 节点之前打印的方式
JSX 中的 console 代码不能简单的在前面插入一个节点，
而要把整体替换成一个数组表达式，因为 JSX 中只支持写单个表达式。
================================================================================== */

/* const targetCalleeName = ['log','info','error','debug'].map(item=>`console.${item}`);
traverse(ast,{
    CallExpression(path,state){

        //通过标记跳过新增节点的处理,因为新节点本身就是最新的了，不需要处理
        if(path.node.isNew){
            return;
        }
        const calleeName = path.get("callee").toString();

        if(targetCalleeName.includes(calleeName)){
            //拿到line和column
            const {line,column} = path.node.loc.start;
            //在参数的首部加上我们想要添加的信息,types库特别适合这种单个添加
            //path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`)) 
            //因为需要添加console.log等一系列内容，而不是只是一个参数，所以我们用template
            const newNode = template.expression(`console.log("filename: (${line}, ${column})")`)(); 
            

            newNode.isNew = true;

            //如果在jsx元素之下，我们就需要替换一个数组，然后再往里边添加
            if(path.findParent(path=>{ return path.isJSXElement()})){
                //newNode在前，当前节点在后
                path.replaceWith(types.arrayExpression([newNode,path.node]));
                //replace的新节点需要调用path.skip跳过后续遍历
                path.skip();

            }else{
                //如果不是就直接在前边添加就可以了
                path.insertBefore(newNode);

            }
        }
    }
}) */

/* 
const {code,map} = generate(ast);
console.log(code);
 */

//version4 形成一个babel插件
/* ================================================================================
上边完成的功能想要复用
就得封装成插件的形式，babel支持transform插件
形式是函数返回一个对象，对象有一个visitor属性
//外层函数有api和options
module.exports = function(api, options) {
  //里边返回一个对象
  return {
    //对象有一个visitor属性
    visitor: {
      Identifier(path, state) {},
    },
  };
}
我们可以对上边的代码进行改造
================================================================================== */

//因为写了插件，这里用到core里边的快捷方法
const sourceCode = fs.readFileSync(path.join(__dirname, './sourceCode.js'), {
    encoding: 'utf-8'
});
const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
});
const {code} = transformFromAstSync(ast,sourceCode,{
    plugins:[insertParametersPlugin]
})

console.log(code);
 






