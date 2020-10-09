class Lexer {
	lex(text) {
		this.text = text;
		this.index = 0;
		this.ch = undefined;
		this.tokens = [];
		while (this.index < this.text.length) {
			this.ch = this.text.charAt(this.index);
			if (
				this.isNumber(this.ch) ||
				(this.ch === '.' && this.isNumber(this.peek()))
			) {
				this.readNumber();
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
				}  else if ((ch === '+' || ch === '-') && this.pre() !== 'e') {
					throw 'invalid number: ' + this.text;
				}
				else {
					break;
				}
			}
			this.index++;
		}

		this.tokens.push({ text: number, value: Number(number) });
	}

	/**
	 * valid char after the `e` in scientific notation
	 * @param  ch
	 */
	isExpOperator(ch) {
		return ch === '-' || ch === '+' || this.isNumber(ch);
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
		return { type: AST.Program, body: this.constant() };
	}

	constant() {
		return { type: AST.Literal, value: this.tokens[0].value };
	}
}

AST.Literal = 'Literal';
AST.Program = 'Program';

class ASTCompiler {
	constructor(astBuiler) {
		this.astBuiler = astBuiler;
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

			case AST.Literal:
				return ast.value;
		}
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
