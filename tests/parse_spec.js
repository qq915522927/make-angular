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
});
