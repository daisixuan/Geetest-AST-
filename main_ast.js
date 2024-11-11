const parser = require("@babel/parser");//将JS源码转换成语法树的函数
const traverse = require("@babel/traverse").default;//遍历AST的函数
const types = require("@babel/types");//操作节点的函数，比如判断节点类型，生成新的节点等:
const generator = require("@babel/generator").default;//将语法树转换为源代码的函数
const fs = require('fs');

function init(ast) {
    traverse(ast, {
        "Program"(path) {
            var exppath0 = path.get("body.0")
            var exppath1 = path.get("body.1")
            var exppath2 = path.get("body.2")
            var exppath3 = path.get("body.3")
            var fucpath = path.get("body.4")
            global_eval_code = exppath0 + "\n" + exppath1 + "\n" + exppath2 + "\n" + exppath3 + "\n" + fucpath + "\n";
            eval(global_eval_code);
            init_func_name = fucpath.node.id.name;
            Array_func_name = exppath2.node.expression.left.property.name;
            Array2_func_name = exppath3.node.expression.left.property.name;
            globalThis[init_func_name] = eval(init_func_name)
            path.node.body = [path.node.body[path.node.body.length-1]]
        }
    });
}


var Array_func = function (arg) {
    let func_name1 = init_func_name + "." + Array_func_name;
    let value1 = eval(func_name1 + "(" + arg + ")");
    return value1
};

var Array2_func = function (arg1, arg2) {
    let func_name2 = init_func_name + "." + Array2_func_name;
    let value2 = eval(func_name2 + "()[" + arg1 + "][" + arg2 + "]");
    return value2
};
var name_Array = [];

const visitor = {
    VariableDeclaration: {
        enter: [get_name_Array, del_DAi]
    },
    CallExpression: {
        enter: [replace_name_Array, replace_DAi]
    },
    StringLiteral: {
        enter: [replace_unicode]
    },
    ForStatement: {
        enter: [replaceForStatement]
    }
};

function replace_unicode(path) {
    delete path.node.extra;
}

function replace_DAi(path) {
    var node = path.node;
    if (node.callee == undefined || node.callee.property == undefined)
        return;
    if (node.callee.property.name == Array_func_name) {
        let arg = node.arguments[0].value;
        let value = Array_func(arg);
        PathToLiteral(path, value)
    }
}

function get_name_Array(path) {
    var node = path.node;
    if (node.declarations == undefined
        || node.declarations.length != 3
        || node.declarations[0].init == undefined
        || node.declarations[0].init.property == undefined)
        return;
    if (node.declarations[0].init.property.name != Array_func_name)
        return;
    let name1 = node.declarations[0].id.name;
    let name2 = node.declarations[2].id.name;
    name_Array.push(name1, name2);
}

function replace_name_Array(path) {
    var node = path.node;
    if (node.callee == undefined || node.callee.name == undefined)
        return;
    if (name_Array.indexOf(node.callee.name) == -1)
        return;
    let arg = node.arguments[0].value;
    let value = Array_func(arg);
    PathToLiteral(path, value)
}

function PathToLiteral(path, value) {
    switch (typeof value) {
        case 'boolean':
            path.replaceWith(types.booleanLiteral(value));
            break;
        case 'string':
            path.replaceWith(types.stringLiteral(value));
            break;
        case 'number':
            path.replaceWith(types.numericLiteral(value));
            break;
        default:
            console.log("出现其他类型" + value + "类型:" + typeof value);
            console.log(value);
            break
    }
}

function check_DAi(declaration) {
    if (declaration.init == undefined || declaration.init.property == undefined)
        return;
    if (declaration.init.property.name == Array_func_name)
        return true;
}

function del_DAi(path) {
    var node = path.node;
    var arrNode = node.declarations;
    for (var i = 0; i < arrNode.length; i++) {
        if (check_DAi(arrNode[i]) == true) {
            path.remove();
            var nextPath = path.getNextSibling();
            nextPath.remove();//删除下个节点
            var nnextPath = nextPath.getNextSibling();
            nnextPath.remove();//删除下下个节点
            break
        }
    }
}

function replaceForStatement(path) {
    var node = path.node;
    var prevSiblingPath = path.getPrevSibling();
    if (prevSiblingPath.container == undefined ||
        prevSiblingPath.container[0] == undefined ||
        prevSiblingPath.container[0].declarations == undefined ||
        prevSiblingPath.container[0].declarations[0].init == undefined ||
        prevSiblingPath.container[0].declarations[0].init.object == undefined ||
        prevSiblingPath.container[0].declarations[0].init.object.object == undefined
    )
        return;
    if (prevSiblingPath.container[0].declarations[0].init.object.object.callee.property.name != Array2_func_name)
        return;
    var body = node.body.body;
    if (!types.isSwitchStatement(body[0] ||
        !types.isIdentifier(body[0].discriminant)))
        return;

    var swithStm = body[0];

    var arg = prevSiblingPath.container[0].declarations[0].init;
    let init_arg_f = arg.object.property.value;
    let init_arg_s = arg.property.value;

    var init_arg = Array2_func(init_arg_f, init_arg_s);
    let break_arg_f = node.test.right.object.property.value;
    let break_arg_s = node.test.right.property.value;
    var break_init = Array2_func(break_arg_f, break_arg_s);

    var caseList = swithStm.cases;
    var resultBody = [];

    for (var i = 0; i < caseList.length; i++) {
        for (; init_arg !== break_init;) {
            var case_arg_f = caseList[i].test.object.property.value;
            var case_arg_s = caseList[i].test.property.value;
            var case_init = Array2_func(case_arg_f, case_arg_s);
            if (init_arg == case_init) {
                var targetBody = caseList[i].consequent;
                if (types.isBreakStatement(targetBody[targetBody.length - 1]) &&
                    types.isExpressionStatement(targetBody[targetBody.length - 2]) &&
                    targetBody[targetBody.length - 2].expression.right.object.object.callee.object.name == init_func_name) {
                    var change_arg_f = targetBody[targetBody.length - 2].expression.right.object.property.value;
                    var change_arg_s = targetBody[targetBody.length - 2].expression.right.property.value;
                    init_arg = Array2_func(change_arg_f, change_arg_s);
                    targetBody.pop();
                    targetBody.pop();
                } else if (types.isBreakStatement(targetBody[targetBody.length - 1])) {
                    targetBody.pop();
                }
                resultBody = resultBody.concat(targetBody);
                break;
            } else {
                break;
            }

        }

    }
    path.replaceWithMultiple(resultBody);
    prevSiblingPath.remove();
}

function main(){
    var args = process.argv
    console.time("耗时")
    console.log("混淆的js路径", args[2], "反混淆的js路径", args[3])
    var jscode = fs.readFileSync(args[2], {
    encoding: "utf-8"
});
    let ast = parser.parse(jscode);
    init(ast)
    traverse(ast, visitor);
    let {code} = generator(ast,{jsescOption:{
	//自动转义中文
		minimal:true
	}});
    fs.writeFile(args[3], code, (err)=>{});
    console.timeEnd("耗时")
    console.log("反混淆成功!")
}
main();