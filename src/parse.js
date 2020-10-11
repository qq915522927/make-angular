import * as _ from 'lodash';

let ESCAPES = {
	n: '\n',
	f: '\f',
	r: '\r',
	t: '\t',
	v: '\v',
	"'": "'",
	'"': '"'
};
class Lexer {
	lex(text) {
		this.text = text;
		this.index = 0;
		this.ch = undefined;
		this.tokens = [];
		while (this.index < this.text.length) {
			this.ch = this.text.charAt(this.index);
			if (this.isWhitespace(this.ch)) {
				this.index++;
				continue;
			}
			if (
				this.isNumber(this.ch) ||
				(this.ch === '.' && this.isNumber(this.peek()))
			) {
				this.readNumber();
			} else if (this.ch === "'" || this.ch === '"') {
				this.readString();
			} else if (this.ch === '[' || this.ch === ']' || this.ch === ',') {
				this.tokens.push({ text: this.ch });
				this.index++;
			} else if (this.isIdent(this.ch)) {
				this.readIdent();
			} else {
				throw 'Unexpected next character: ' + this.ch;
			}
		}

		return this.tokens;
	}

	isNumber(ch) {
		if (!ch) {
			return false;
		}
		return '0' <= ch && ch <= '9';
	}

	isWhitespace(ch) {
		return (
			ch === ' ' ||
			ch === '\r' ||
			ch === '\t' ||
			ch === '\n' ||
			ch === '\v' ||
			ch === '\u00A0'
		);
	}

	readNumber() {
		let number = '';
		while (this.index < this.text.length) {
			let ch = this.text.charAt(this.index).toLowerCase();
			if (this.isNumber(ch) || ch === '.') {
				number += ch;
			} else if (ch === 'e') {
				if (this.isExpOperator(this.peek())) {
					number += ch;
				} else {
					throw 'invalid number: ' + this.text;
				}
			} else {
				if (ch === 'e' && this.isExpOperator(this.peek())) {
					number += ch;
				} else if (
					(ch === '+' || ch === '-') &&
					this.pre() === 'e' &&
					this.isNumber(this.peek())
				) {
					number += ch;
				} else if (
					(ch === '+' || ch === '-') &&
					this.pre() === 'e' &&
					!this.isNumber(this.peek())
				) {
					throw 'invalid number: ' + this.text;
				} else if ((ch === '+' || ch === '-') && this.pre() !== 'e') {
					throw 'invalid number: ' + this.text;
				} else {
					break;
				}
			}
			this.index++;
		}

		this.tokens.push({ text: number, value: Number(number) });
	}

	readString() {
		let quote = this.text.charAt(this.index);
		this.index++;
		let string = '';
		let escape = false;
		while (this.index < this.text.length) {
			let ch = this.text.charAt(this.index);
			if (escape) {
				if (ch === 'u') {
					let hex = this.text.substring(this.index + 1, this.index + 5);
					if (!hex.match(/[\da-f]{4}/i)) {
						throw 'invalid unicode escape';
					}
					this.index += 4;
					string += String.fromCharCode(parseInt(hex, 16));
				} else {
					let replacement = ESCAPES[ch];
					if (replacement) {
						string += replacement;
					} else {
						string += ch;
					}
				}
				escape = false;
			} else if (ch === '\\') {
				escape = true;
			} else if (ch !== "'" && ch !== '"') {
				string += ch;
			} else {
				if (ch !== quote) {
					throw 'mismatching quote';
				}
				this.index++;
				this.tokens.push({ text: string, value: string });
				return;
			}
			this.index++;
		}

		throw 'Unclosed string';
	}

	readIdent() {
		let identifier = '';

		while (this.index < this.text.length) {
			let ch = this.text.charAt(this.index);

			if (this.isIdent(ch) || this.isNumber(ch)) {
				identifier += ch;
			} else {
				break;
			}
			this.index++;
		}

		this.tokens.push({ text: identifier });
	}

	/**
	 * valid char after the `e` in scientific notation
	 * @param  ch
	 */
	isExpOperator(ch) {
		return ch === '-' || ch === '+' || this.isNumber(ch);
	}

	/**
	 * if it's the bengining of an indentifier
	 */
	isIdent(ch) {
		return (
			(ch >= 'a' && ch <= 'z') ||
			(ch >= 'A' && ch <= 'Z') ||
			ch === '_' ||
			ch === '$'
		);
	}

	peek() {
		if (this.index < this.text.length - 1) {
			return this.text.charAt(this.index + 1);
		}
		return false;
	}

	pre() {
		if (this.index > 0) {
			return this.text.charAt(this.index - 1);
		}
		return false;
	}
}

class AST {
	constructor(lexer) {
		this.lexer = lexer;
	}

	ast(text) {
		this.tokens = this.lexer.lex(text);
		return this.program();
	}

	program() {
		return { type: AST.Program, body: this.primary() };
	}

	constant() {
		return { type: AST.Literal, value: this.consume().value };
	}

	primary() {
		if (this.expect('[')) {
			return this.arrayDeclaration();
		}
		let token = this.tokens[0];
		if (AST.constants.hasOwnProperty(token.text)) {
			return AST.constants[this.consume().text];
		}
		return this.constant();
	}

	expect(e) {
		let token = this.peek(e);
		if (token) {
			return this.tokens.shift();
		}
	}
	peek(e) {
		if (this.tokens.length > 0) {
			if (this.tokens[0].text === e || !e) {
				return this.tokens[0];
			}
		}
	}

	consume(e) {
		let token = this.expect(e);
		if (!token) {
			throw 'Unexpected. Expecting: ' + e;
		}
		return token;
	}

	arrayDeclaration() {
		let elements = [];
		if (!this.peek(']')) {
			do {
				elements.push(this.primary());
			} while (this.expect(',') && !this.peek(']'));
		}
		this.consume(']');
		return { type: AST.ArrayExpression, elements: elements };
	}
}

AST.Literal = 'Literal';
AST.Program = 'Program';
AST.ArrayExpression = 'ArrayExpression';
AST.constants = {
	null: { type: AST.Literal, value: null },
	true: { type: AST.Literal, value: true },
	false: { type: AST.Literal, value: false }
};

class ASTCompiler {
	constructor(astBuiler) {
		this.astBuiler = astBuiler;
		this.stringEscapeRegex = /[^ a-zA-Z0-9]/g;
	}

	compile(text) {
		let ast = this.astBuiler.ast(text);
		this.state = { body: [] };
		this.recurse(ast);
		return new Function(this.state.body.join(' '));
	}

	recurse(ast) {
		switch (ast.type) {
			case AST.Program:
				this.state.body.push('return', this.recurse(ast.body), ';');
				break;
			case AST.ArrayExpression:
				return (
					'[' +
					ast.elements
						.map(ele => {
							return this.recurse(ele);
						})
						.join(',') +
					']'
				);

			case AST.Literal:
				return this.escape(ast.value);
		}
	}

	escape(value) {
		if (_.isString(value)) {
			return (
				"'" + value.replace(this.stringEscapeRegex, this.stringEscapeFn) + "'"
			);
		}
		if (_.isNull(value)) {
			return 'null';
		}
		return value;
	}

	stringEscapeFn(ch) {
		return '\\u' + ('0000' + ch.charCodeAt(0).toString(16)).slice(-4);
	}
}

class Parser {
	constructor(lexer) {
		this.lexer = lexer;
		this.ast = new AST(this.lexer);
		this.astCompiler = new ASTCompiler(this.ast);
	}

	parse(text) {
		return this.astCompiler.compile(text);
	}
}

export function parse(expr) {
	let lexer = new Lexer();
	let parser = new Parser(lexer);
	return parser.parse(expr);
}
