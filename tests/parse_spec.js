import { parse } from '../src/parse';

describe('parse', function() {
	it('can parse an integer', function() {
		let fn = parse('42');
		expect(fn).toBeDefined();
		expect(fn()).toBe(42);
	});
	it('can parse a floating point number', function() {
		let fn = parse('1.2');
		expect(fn).toBeDefined();
		expect(fn()).toBe(1.2);
	});

	it('can parse a floating point number without an ingeger part', function() {
		let fn = parse('.22');
		expect(fn).toBeDefined();
		expect(fn()).toBe(0.22);
	});
	it('can parse a number in scientific notation', function() {
		let fn = parse('23e3');
		expect(fn).toBeDefined();
		expect(fn()).toBe(23000);
	});
	it('can parse a scientific notation with a float coefficient', function() {
		let fn = parse('.23e3');
		expect(fn).toBeDefined();
		expect(fn()).toBe(230);
	});

	it('can parse a scientific notation with negative exponents', function() {
		let fn = parse('2200e-2');
		expect(fn).toBeDefined();
		expect(fn()).toBe(22);
	});
	it('can parse a scientific notation with the + sign', function() {
		let fn = parse('2200e+2');
		expect(fn).toBeDefined();
		expect(fn()).toBe(220000);
	});
	it('can parse upper case scientific notation', function() {
		let fn = parse('.22E2');
		expect(fn).toBeDefined();
		expect(fn()).toBe(22);
	});
	it('can not parse a invalid scientific notation ', function() {
		'';
		expect(() => {
			parse('.23e');
		}).toThrow();

		expect(() => {
			parse('.23e-');
		}).toThrow();

		expect(() => {
			parse('.23ea');
		}).toThrow();

		expect(() => {
			parse('.23-3');
		}).toThrow();
	});

	it('can parse a string in single quotes', function() {
		let fn = parse("'abc'");
		expect(fn()).toEqual('abc');
	});
	it('can parse a string in double quotes', function() {
		let fn = parse('"abc"');
		expect(fn()).toEqual('abc');
	});

	it('will not parse a string with mismatching quotes', function() {
		expect(() => {
			parse('"abc\'');
		}).toThrow();
	});

	it('can parse a string with single quotes inside', function() {
		let fn = parse("'a\\'b'"); // 'a\'b'
		expect(fn()).toEqual("a'b");
	});

	it('can parse a string with double quotes inside', function() {
		let fn = parse('"a\\"b"'); // 'a\"b'
		expect(fn()).toEqual('a"b');
	});
	it('will parse a string with unicode escapes', function() {
		let fn = parse('"\\u00A0"');
		expect(fn()).toEqual('\u00A0');
	});

	it('will not parse a string with invalid unicode escapes', function() {
		expect(function() {
			parse('"\\u00T0"');
		}).toThrow();
	});

	it('will parse null', function() {
		let fn = parse('null');
		expect(fn()).toBe(null);
	});
	it('will parse true', function() {
		let fn = parse('true');
		expect(fn()).toBe(true);
	});
	it('will parse false', function() {
		let fn = parse('false');
		expect(fn()).toBe(false);
	});

	it('ingores whitespace', function() {
		let fn = parse(' \n42 ');
		expect(fn()).toEqual(42);
	});

	it('will parse an empty array', function() {
		let fn = parse('[]');
		expect(fn()).toEqual([]);
	});
	it('will parse an non-empty array', function() {
		let fn = parse("[1, 'two', true, [3]]");
		expect(fn()).toEqual([1, 'two', true, [3]]);
	});
	it('will parse an array with trailing commas', function() {
		let fn = parse('[1,2,3,]');
		expect(fn()).toEqual([1, 2, 3]);
	});
});
