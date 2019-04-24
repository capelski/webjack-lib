const cartesianProduct = <T, U, R>(firstArray: T[], secondArray: U[], elementBuilder: (t: T, u: U) => R): R[] => {
    return firstArray.reduce((product, x) => {
        return product.concat(secondArray.map(y => elementBuilder(x, y)));
    }, [] as R[]);
};

const delay = (minimumTime = 500) => {
    return new Promise(resolve => setTimeout(resolve, minimumTime));
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
    delay,
    removeDuplicates,
    shuffleArray
};

export default {
    cartesianProduct,
    delay,
    removeDuplicates,
    shuffleArray
};
