/*
源码parse成AST之后，就要进行AST的遍历和增删改
babel会递归遍历AST
遍历过程中处理到不同的AST会调用不同的visitor函数来实现transform
这是visitor模式的应用
*/

