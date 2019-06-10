export const cartesianProduct = <T, U, R>(
    firstArray: T[],
    secondArray: U[],
    elementBuilder: (t: T, u: U) => R
): R[] => {
    return firstArray.reduce((product, x) => {
        return product.concat(secondArray.map(y => elementBuilder(x, y)));
    }, [] as R[]);
};

export const delay = (minimumTime = 500) => {
    return new Promise<void>(resolve => setTimeout(resolve, minimumTime));
};

export const removeDuplicates = (numbers: number[]): number[] => {
    const numbersDictionary: { [key: string]: number } =
        numbers.reduce((dictionary, next) => ({...dictionary, [next]: next}), {});
    return Object.keys(numbersDictionary).map(x => numbersDictionary[x]);
};

export const shuffleArray = (array: any[]) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};
