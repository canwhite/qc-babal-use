//1.因为Mozilla公布了piderMonkey（c++写的js引擎）的parser api和AST 标准，so出现了 esprima，形成了estree标准
//2.因为js版本更新，eslint就fork了一份esprima，出了espree
//3.后来出了acorn，也是estree标准，但是支持插件，espree 2.0基于acorn重新实现了,支持了插件
//4.babel parser(babylon) 也是基于 acorn，并且对 AST 节点和属性都做了扩展，也提供了一些支持 typescript、jsx、flow 的插件


/* ============================================================================================================
babel 基于 acorn 插件对 estree AST 做了如下扩展

把 Literal 替换成了 StringLiteral、NumericLiteral、 BigIntLiteral、 BooleanLiteral、 NullLiteral、 RegExpLiteral
把 Property 替换成了 ObjectProperty 和 ObjectMethod
把 MethodDefinition 替换成了 ClassMethod
Program 和 BlockStatement 支持了 directives 属性，也就是 'use strict' 等指令的解析，对应的 ast 是 Directive 和 DirectiveLiteral
ChainExpression 替换为了 ObjectMemberExpression 和 OptionalCallExpression 
ImportExpression 替换为了 CallExpression 并且 callee 属性设置为 Import
=============================================================================================================*/

//babel parser 基于acorn扩展了一些语法，那么它是怎么扩展的呢，我们写一个acorn插件来感受下

const acorn = require("acorn");
const Parser = acorn.Parser;//拿到Parser
const TokenType = acorn.TokenType;//拿到TokenType


//通过extend拓展parser并创建Parser，这点怎么这么像Vue
/* const MyParser = Parser.extend(
    require("acorn-jsx")(),
    require("acorn-bigint")
)
let ast =  MyParser.parse("// Some bigint + JSX code")
console.log(ast) */

//关于插件，接收一个之前的Parser，返回拓展之后的Parser
/* module.exports = function noisyReadToken(Parser) {
    return class extends Parser {
      readToken(code) {
        console.log("Reading a token!")
        super.readToken(code)
      }
    }
  }
  ---
如果这样来理解的化，Vue接收之前的Vue，
返回一个拓展之后的Vue，这样组件、mixin和vuex就都有了
*/


/* 我们这里实现一个acorn插件
目标：给js一个关键字guang，可以作为statement单独使用
分解：我们知道parse的过程其实就是
1.分词（词法分析）
2.组装ast（语法分析）
*/


//1-2.然后注册一个新的token类型来标识它，
//这样acorn就会在parse的时候分出guang这个关键词了
Parser.acorn.keywordTypes["guang"] = new TokenType(
  "guang",
  {keyword: "guang"}
);

var guangKeywordPlugin = function(Parser){
    return class extends Parser{
        /*=======================================================================
          1.分词
          我们想要增加一个关键字，acorn有keywords属性，是一个正则表达式，用来作关键字拆分
          所以我们重写keywords属性就可以
          并且我们还要为新的关键字注册一个token类型
          acron Parser的入口方法是parse,我们要在
        ========================================================================*/
        //1-1.我们想要增加一个关键字，acorn有keywords属性，是一个正则表达式，用来作关键字拆分
        //所以我们重写keywords属性就可以
        parse(program){
          let newKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this const class extends export import super";
          newKeywords += "guang";
          //目的就是重写这个keywords
          this.keywords = new RegExp("^(?:" + newKeywords.replace(/ /g, "|") + ")$");
          //返回我们想要返回的内容
          return(super.parse(program))
        }
        /*
          2.组装AST
          光分出token是没有用的，要组装到ast中
          acorn在parse到不同的类型的节点会调用不同的parseXxx方法
          因为我们是在statement里边用，
          所以我们要重写parseStatement，这里也主要通过重写来完成组装
          在里边组装新的statement节点
        */

        parseStatement(context,topLevel,exports){

          //this.type是当前要处理到的token类型
          var tokenType = this.type;
          if(tokenType == Parser.acorn.keywordTypes["guang"]){
            //通过this.startNode创建一个新的AST节点
            var node = this.startNode();
            //然后消费掉这个token
            return this.parseGuangStatement(node);

          }else{
            //如果不是我们拓展的token，就调用父类的parseStatement处理
            return(super.parseStatement(context,topLevel,exports));

          }
        }
        parseGuangStatement(node) {
          this.next();
          return this.finishNode({value: 'guang'},'GuangStatement');
        }

        /* parseLiteral (...args) {
          const node = super.parseLiteral(...args);
          switch(typeof node.value) {
              case 'number':
                  node.type = 'NumericLiteral';
                  break;
              case 'string':
                  node.type = 'StringLiteral';
                  break;
          }
          return  node;
        } */

    }
}

const newParser = Parser.extend(guangKeywordPlugin);

var program = 
`
    guang
    const a = 1
`;

const ast2 = newParser.parse(program);
console.log(ast2);