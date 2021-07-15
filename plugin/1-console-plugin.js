const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
//函数，引入需要的api
module.exports = function({types, template}) {
    //返回一个对象
    return {
        //里边有一个visitor属性
        visitor: {
            CallExpression(path, state) {
                if (path.node.isNew) {
                    return;
                }
                const calleeName = path.get("callee").toString();

                 if (targetCalleeName.includes(calleeName)) {
                    const { line, column } = path.node.loc.start;
                    //置换表达式
                    const newNode = template.expression(`console.log("${state.file.filename || 'unkown filename'}: (${line}, ${column})")`)();
                    console.log("--newNode--",newNode); 
                    /* {
                        type: 'CallExpression',
                        callee: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'console',
                            loc: undefined,
                            leadingComments: undefined,
                            innerComments: undefined,
                            trailingComments: undefined,
                            extra: {}
                          },
                          property: {
                            type: 'Identifier',
                            name: 'log',
                            loc: undefined,
                            leadingComments: undefined,
                            innerComments: undefined,
                            trailingComments: undefined,
                            extra: {}
                          },
                          computed: false,
                          loc: undefined,
                          leadingComments: undefined,
                          innerComments: undefined,
                          trailingComments: undefined,
                          extra: {}
                        },
                        arguments: [
                          {
                            type: 'StringLiteral',
                            value: 'unkown filename: (12, 21)',
                            loc: undefined,
                            leadingComments: undefined,
                            innerComments: undefined,
                            trailingComments: undefined,
                            extra: [Object]
                          }
                        ],
                        loc: undefined,
                        leadingComments: undefined,
                        innerComments: undefined,
                        trailingComments: undefined,
                        extra: { parenthesized: true, parenStart: 0 }
                    } */
                    


                    newNode.isNew = true;
                    if (path.findParent(path => path.isJSXElement())) {
                        path.replaceWith(types.arrayExpression([newNode, path.node]))
                        path.skip();
                    } else {
                        path.insertBefore(newNode);
                    }
                }
            }
        }
    }
}