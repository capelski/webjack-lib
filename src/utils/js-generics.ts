'use strict';

const cartesianProduct = <T, U>(firstArray: T[], secondArray: U[], elementBuilder: (t: T, u: U) => any) => {
    return [].concat.apply([], firstArray.map(function (x) {
        return [].concat.apply([], secondArray.map(function (y) {
            return [elementBuilder(x, y)];
        }));
    }));
};

const clone = (source: any) => {
    if (typeof(source) !== typeof({})) {
        return source;
    }
    var newObject = source instanceof Array ? [] : {} as {[key: string]: any};
    iterate(source, (element: any, key: string) => {
        if (element instanceof Array || typeof(element) === typeof({})) {
            newObject[key] = clone(source[key]);
        } else {
            newObject[key] = source[key];
        }                
    });
    return newObject;
};

const createArray = (size: number, elementBuilder: Function) => {
    var array: any[] = [];
    repeat(size, (iterationNumber: number) => {
        var newArray = elementBuilder(array, iterationNumber - 1);
        if (newArray) {
            array = newArray;
        }
    });
    return array;
};

const iterate = (iterable: any[], functionExpression: Function) => {
    for (var key in iterable) {
        functionExpression(iterable[key], key);
    }
};

const iterateFor = (array: any[], functionExpression: Function) => {
    for (var i = 0; i < array.length; ++i) {
        functionExpression(array[i], i);
    }
};

const numericalRange = (lowerBoundary: number, upperBoundary: number) => {
    let range = [];
    for (var i = lowerBoundary; i <= upperBoundary; ++i) {
        range.push(i);
    }
    return range;
};

const percentizeValues = () => {
    var total = 0,
    index;            
    for (index in arguments) {
        total += arguments[index];
    }
    var values = [];
    for (index in arguments) {
        var value = arguments[index];
        var percentizedValue = 0;
        if (total > 0) {
            percentizedValue = Math.round(value * 10000 / total) / 100;
        }
        values.push(percentizedValue);
    }
    return values;
};

const removeDuplicates = (numbers: number[]): number[] => {
    const numbersDictionary: { [key: string]: number } =
        numbers.reduce((dictionary, next) => ({...dictionary, [next]: next}), {});
    return Object.keys(numbersDictionary).map(x => numbersDictionary[x]);
};

const repeat = (iterationsNumber: number, functionExpression: Function) => {
    for (var i = 1; i < (iterationsNumber + 1); ++i) {
        functionExpression(i);
    }
};

const shuffleArray = (array: any[]) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};

export {
    cartesianProduct,
    iterate,
    clone,
    removeDuplicates,
    repeat,
    createArray,
    iterateFor,
    numericalRange,
    percentizeValues,
    shuffleArray
};

export default {
    cartesianProduct,
    iterate,
    clone,
    removeDuplicates,
    repeat,
    createArray,
    iterateFor,
    numericalRange,
    percentizeValues,
    shuffleArray
};
