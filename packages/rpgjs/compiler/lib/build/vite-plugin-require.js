// fork to https://github.com/wangzongming/vite-plugin-require
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import { importDeclaration, importDefaultSpecifier, stringLiteral, identifier, newExpression, expressionStatement, memberExpression } from "@babel/types";
const traverse = _traverse['default'] ?? _generate;
const generate = _generate['default'] ?? _generate;
export default function vitePluginRequire(opts) {
    const { fileRegex = /(.jsx?|.tsx?)(\?v=[0-9a-f]+)?$/, log, translateType = "import" } = opts || {};
    return {
        name: "vite-plugin-require",
        async transform(code, id) {
            let newCode = code;
            // if module name begins by rpgjs- or @rpgjs, so traverse it. Else, ignore node_modules
            const regex = /^(?!.*node_modules(?:\/|\\)(?!rpgjs-|@rpgjs)).*$/;
            if (fileRegex.test(id) && regex.test(id)) {
                const ast = parser.parse(code, {
                    sourceType: "module",
                    plugins: [],
                });
                traverse(ast, {
                    enter(path) {
                        if (path.isIdentifier({ name: "require" })) {
                            const arg = path.container?.arguments?.[0];
                            if (arg) {
                                let stringVal = "";
                                switch (arg?.type) {
                                    case "StringLiteral":
                                        stringVal = arg.value;
                                        break;
                                    case "Identifier":
                                        const IdentifierName = arg.name;
                                        traverse(ast, {
                                            Identifier: (path) => {
                                                if (path.node.name === IdentifierName) {
                                                    if (!Array.isArray(path.container) && path.container.init?.type === "StringLiteral") {
                                                        stringVal = path.container.init.value;
                                                    }
                                                }
                                            },
                                        });
                                        break;
                                    case "BinaryExpression":
                                        const binaryExpressionLoopFn = (lOr) => {
                                            if (lOr.type === "BinaryExpression") {
                                                binaryExpressionLoopFn(lOr.left);
                                                binaryExpressionLoopFn(lOr.right);
                                            }
                                            else {
                                                if (lOr.type === "StringLiteral") {
                                                    stringVal += lOr.value;
                                                }
                                                else if (lOr.type === "Identifier") {
                                                    const IdentifierName = lOr.name;
                                                    traverse(ast, {
                                                        Identifier: (path) => {
                                                            if (path.node.name === IdentifierName) {
                                                                if (!Array.isArray(path.container) && path.container.init?.type === "StringLiteral") {
                                                                    // log((path.container as any).init.value);
                                                                    stringVal += path.container.init.value;
                                                                }
                                                            }
                                                        },
                                                    });
                                                }
                                                else {
                                                    throw `不支持的: BinaryExpression 组成类型 ${lOr.type}`;
                                                }
                                            }
                                        };
                                        binaryExpressionLoopFn(arg.left);
                                        binaryExpressionLoopFn(arg.right);
                                        break;
                                    case "MemberExpression":
                                        // requre(new Url())
                                        break;
                                    default:
                                        throw `Unsupported type: ${arg?.type}`;
                                }
                                path.node.name = "";
                                if (stringVal) {
                                    // Insert import at the top to pack resources when vite packs
                                    let realPath = `vitePluginRequire_${new Date().getTime()}_${parseInt(Math.random() * 100000000 + 100 + "")}`;
                                    if (translateType === "import") {
                                        const importAst = importDeclaration([importDefaultSpecifier(identifier(realPath))], stringLiteral(stringVal));
                                        ast.program.body.unshift(importAst);
                                        switch (arg?.type) {
                                            case "StringLiteral":
                                                path.container.arguments[0].value = realPath;
                                                if (path.container.arguments[0].extra) {
                                                    path.container.arguments[0].extra.raw = realPath;
                                                    path.container.arguments[0].extra.rawValue = realPath;
                                                }
                                                break;
                                            case "Identifier":
                                                path.container.arguments[0].name = realPath;
                                                break;
                                            case "BinaryExpression":
                                                path.container.arguments[0] = identifier(realPath);
                                                break;
                                            default:
                                                throw `Unsupported type: ${arg?.type}`;
                                        }
                                    }
                                    else if (translateType === "importMetaUrl") {
                                        const metaObj = memberExpression(memberExpression(identifier("import"), identifier("meta")), identifier("url"));
                                        const importAst = newExpression(identifier("URL"), [stringLiteral(stringVal), metaObj]);
                                        const hrefObj = expressionStatement(memberExpression(importAst, identifier("href")));
                                        const strCode = generate(hrefObj, {}).code.replace(/\;$/, '');
                                        switch (arg?.type) {
                                            case "StringLiteral":
                                                path.container.arguments[0].value = strCode;
                                                if (path.container.arguments[0].extra) {
                                                    path.container.arguments[0].extra.raw = strCode;
                                                    path.container.arguments[0].extra.rawValue = strCode;
                                                }
                                                break;
                                            case "Identifier":
                                                path.container.arguments[0].name = strCode;
                                                break;
                                            case "BinaryExpression":
                                                path.container.arguments[0] = identifier(strCode);
                                                break;
                                            default:
                                                throw `Unsupported type: ${arg?.type}`;
                                        }
                                    }
                                }
                            }
                        }
                    },
                });
                const output = generate(ast, {});
                newCode = output.code;
            }
            return {
                code: newCode,
                map: null,
            };
        },
    };
}
//# sourceMappingURL=vite-plugin-require.js.map