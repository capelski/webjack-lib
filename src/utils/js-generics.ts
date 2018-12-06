const cartesianProduct = <T, U>(firstArray: T[], secondArray: U[], elementBuilder: (t: T, u: U) => any) => {
    return [].concat.apply([], firstArray.map(function (x) {
        return [].concat.apply([], secondArray.map(function (y) {
            return [elementBuilder(x, y)];
        }));
    }));
};

const removeDuplicates = (numbers: number[]): number[] => {
    const numbersDictionary: { [key: string]: number } =
        numbers.reduce((dictionary, next) => ({...dictionary, [next]: next}), {});
    return Object.keys(numbersDictionary).map(x => numbersDictionary[x]);
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
    removeDuplicates,
    shuffleArray
};

export default {
    cartesianProduct,
    removeDuplicates,
    shuffleArray
};
