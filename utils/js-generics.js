'use strict';

const cartesianProduct = (firstArray, secondArray, elementBuilder) => {
    return [].concat.apply([], firstArray.map(function (x) {
        return [].concat.apply([], secondArray.map(function (y) {
            return [elementBuilder(x, y)];
        }));
    }));
};

const iterate = (array, functionExpression) => {
    for (var key in array) {
        functionExpression(array[key], key);
    }
};

const clone = (source) => {
    if (typeof(source) !== typeof({})) {
        return source;
    }
    var newObject = source instanceof Array ? [] : {};
    iterate(source, (element, key) => {
        if (element instanceof Array || typeof(element) === typeof({})) {
            newObject[key] = clone(source[key]);
        } else {
            newObject[key] = source[key];
        }                
    });
    return newObject;
};

const repeat = (iterationsNumber, functionExpression) => {
    for (var i = 1; i < (iterationsNumber + 1); ++i) {
        functionExpression(i);
    }
};

const createArray = (size, elementBuilder) => {
    var array = [];
    repeat(size, (iterationNumber) => {
        var newArray = elementBuilder(array, iterationNumber - 1);
        if (newArray) {
            array = newArray;
        }
    });
    return array;
};

const iterateFor = (array, functionExpression) => {
    for (var i = 0; i < array.length; ++i) {
        functionExpression(array[i], i);
    }
};

const numericalRange = (lowerBoundary, upperBoundary) => {
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

const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

module.exports = {
    cartesianProduct,
    iterate,
    clone,
    repeat,
    createArray,
    iterateFor,
    numericalRange,
    percentizeValues,
    shuffleArray
};
