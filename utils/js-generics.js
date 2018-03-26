'use strict';

function jsGenerics() {
    return {
        cartesianProduct: function(firstArray, secondArray, elementBuilder) {
            return [].concat.apply([], firstArray.map(function (x) {
                return [].concat.apply([], secondArray.map(function (y) {
                    return [elementBuilder(x, y)];
                }));
            }));
        },
        clone: function(source) {
            if (typeof(source) !== typeof({})) {
                return source;
            }
            var newObject = source instanceof Array ? [] : {};
            this.iterate(source, (element, key) => {
                if (element instanceof Array || typeof(element) === typeof({})) {
                    newObject[key] = this.clone(source[key]);
                } else {
                    newObject[key] = source[key];
                }                
            });
            return newObject;
        },
        createArray: function(size, elementBuilder) {
            var array = [];
            this.repeat(size, (iterationNumber) => {
                var newArray = elementBuilder(array, iterationNumber - 1);
                if (newArray) {
                    array = newArray;
                }
            });
            return array;
        },
        iterate: function(array, functionExpression) {
            for (var key in array) {
                functionExpression(array[key], key);
            }
        },
        iterateFor: function(array, functionExpression) {
            for (var i = 0; i < array.length; ++i) {
                functionExpression(array[i], i);
            }
        },
        numericalRange: function(lowerBoundary, upperBoundary) {
            let range = [];
            for (var i = lowerBoundary; i <= upperBoundary; ++i) {
                range.push(i);
            }
            return range;
        },
        repeat: function(iterationsNumber, functionExpression) {
            for (var i = 1; i < (iterationsNumber + 1); ++i) {
                functionExpression(i);
            }
        },
        percentizeValues: function() {
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
        },
        shuffleArray: function(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        },
        stringifyArray: function(array, elementStringifier, separator) {
            separator = separator || ', ';
            if (array.length === 0) {
                return '';
            }

            return array
            .map((element) => {
                var stringifiedElement = element.toString();
                if (elementStringifier) {
                    stringifiedElement = elementStringifier(element);
                }
                return stringifiedElement;
            })
            .reduce((previous, current) => {
                return previous + separator + current;
            });
        }
    };
}

module.exports = jsGenerics();
