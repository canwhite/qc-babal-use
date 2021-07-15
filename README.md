# qc-babal-use
 Babel's translation learning and use

## des
babel的编译流程  
* parse：通过 parser 把源码转成抽象语法树（AST）
* transform：遍历 AST，调用各种 transform 插件对 AST 进行增删改，遍历的过程中处理到不同的 AST 节点会调用注册的相应的 visitor 函数，对于不同AST节点下边会讲
* generate：把转换后的 AST 打印成目标代码，并生成 sourcemap

AST节点     
* Literal ——字面量
* Identifier——标识符，主要是变量和变量的引用
* Statement——语句，break、continue、debugger、return 或者 if 语句、while 语句、for 语句，还有声明语句、表达式语句等
* Declaration——声明语句，在作用域内声明一个变量、函数、class、import、export
* ClassDeclaration——Class 的语法也有专门的AST节点来表示。整个 class 的内容是 ClassBody，属性是 ClassProperty，方法是ClassMethod（通过 kind 属性来区分是 constructor 还是 method）。  
* Expression——表达式，特点是执行完之后会有返回值，  
&emsp;(1)要和Statement的区别  
语句的特点是能够单独执行,有的表达式可以单独执行，符合语句的特点，所以也是语句，比如赋值表达式、数组表达式等，  
但有的表达式不能单独执行，需要和其他类型的节点组合在一起构成语句。 比如匿名函数表达式和匿名 class 表达式单独执行会报错   
&emsp;(2)this和super也算表达式  
identifier、super 有返回值，符合表达式的特点，所以也是 expression。  
&emsp;(3)表达式语句解析成 AST 的时候会包裹一层 ExpressionStatement 节点，然后才是具体的表达式
* Modules——es module是语法级别的模块规范，所以也有专门的AST节点  
(1)三种import:   
&emsp;1. named import ——import {c, d} from 'c';  
&emsp;2. default import—— import a from 'a';  
&emsp;3. namespaced import  ——import * as b from 'b';  
分别对应   
&emsp;1. ImportSpicifier  
&emsp;2. ImportDefaultSpecifier  
&emsp;3. ImportNamespaceSpcifier  
(1)三种export:   
&emsp;1. named export ——export { b, d};   
&emsp;2. default export—— export default a;  
&emsp;3. namespaced import  ——export * from 'c';  
分别对应     
&emsp;1. ExportNamedDeclaration  
&emsp;2. ExportDefaultDeclaration  
&emsp;3. ExportAllDeclaration    
* Program & Directive —— program 是代表整个程序的节点，它有 body 属性代表程序体，存放 statement 数组，就是具体执行的语句的集合。还有 directives 属性，存放Directive 节点，比如"use strict" 这种指令会使用 Directive 节点表示。
* File & Comment——babel 的 AST 最外层节点是 File，它有 program、comments、tokens 等属性，分别存放 Program 程序体、注释、token 等，是最外层节点。  
注释分为块注释和行内注释，对应 CommentBlock 和 CommentLine 节点。

上边只是大致介绍了分类，如果想看全类型可以看文档    
[AST Type](https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md)  
或者直接看代码也可以  
[code](https://github.com/babel/babel/blob/main/packages/babel-types/src/ast-types/generated/index.ts)


## Common Property
* type： AST 节点的类型
* start、end、loc：start 和 end 代表该节点对应的源码字符串的开始和结束下标，不区分行列。而 loc 属性是一个对象，有 line 和 column 属性分别记录开始和结束行列号。
* leadingComments、innerComments、trailingComments： 表示开始的注释、中间的注释、结尾的注释，因为每个 AST 节点中都可能存在注释，而且可能在开始、中间、结束这三种位置，通过这三个属性来记录和 Comment 的关联。
* extra：记录一些额外的信息，用于处理一些特殊情况。比如 StringLiteral 修改 value 只是值的修改，而修改 extra.raw 则可以连同单双引号一起修改。

## tools

我们并不需要记什么内容对应什么 AST 节点，可以通过下面这个网站来直观的查看。  
[astexplorer](https://astexplorer.net/)

## apis

* @babel/parser 对源码进行 parse，可以通过 plugins、sourceType 等来指定 parse 语法
* @babel/traverse 通过 visitor 函数对遍历到的 ast 进行处理，分为 enter 和 exit 两个阶段，具体操作 AST 使用 path 的 api，还可以通过 state 来在遍历过程中传递一些数据
* @babel/types 用于创建、判断 AST 节点，提供了 xxx、isXxx、assertXxx 的 api
* @babel/template 用于批量创建节点
* @babel/code-frame 可以创建友好的报错信息
* @babel/generator 打印 AST 成目标代码字符串，支持 comments、minified、sourceMaps 等选项。
* @babel/core 基于上面的包来完成 babel 的编译流程，可以从源码字符串、源码文件、AST 开始。

