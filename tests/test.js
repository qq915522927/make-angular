import  {add}  from '../src/index.js';

describe("Module should return", function () {
  it("some number", function () {
    expect(add(1,2)).toEqual(3);
  });
});