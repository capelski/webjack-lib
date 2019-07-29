interface IDictionary<T> {
    [key: string]: T;
}

export const cartesianProduct = <T, U, R>(
    firstArray: T[],
    secondArray: U[],
    elementBuilder: (t: T, u: U) => R
): R[] => {
    return firstArray.reduce(
        (product, x) => {
            return product.concat(secondArray.map(y => elementBuilder(x, y)));
        },
        [] as R[]
    );
};

export const delay = (minimumTime = 500) =>
    new Promise<void>(resolve => setTimeout(resolve, minimumTime));

export const removeDuplicates = (numbers: number[]): number[] => {
    const numbersDictionary: IDictionary<number> = numbers.reduce(
        (dictionary, next) => ({ ...dictionary, [next]: next }),
        // tslint:disable-next-line:no-object-literal-type-assertion
        {} as IDictionary<number>
    );
    return Object.keys(numbersDictionary).map(x => numbersDictionary[x]);
};

export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};
