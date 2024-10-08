export function transformToCamel(nameArr: string[]): string {
	if (!nameArr[0]) {
		nameArr.shift();
	}

	return nameArr.reduce((prev, current) => {
		return prev + toCapitalize(current);
	});
}

export function camelToIName(camel: string): string {
	return `I${toCapitalize(camel)}`;
}

export function toCapitalize(resource = ""): string {
	return `${resource[0].toUpperCase()}${resource.slice(1)}`;
}

export function snakeToCamel(snake = ""): string {
	if (snake.includes("_")) {
		const snakeResolve = snake.replace(/-/g, "");

		const snakeArr = snakeResolve.split("_");
		return snakeArr.reduce((prev, current) => {
			return prev + toCapitalize(current);
		});
	}
	const snakeResolve = snake.replace(/(\{|\})/g, "");
	const snakeArr = snakeResolve.split("-");
	return snakeArr.reduce((prev, current) => {
		return prev + toCapitalize(current);
	});
}

export function urlToKebab(nameArr: string[] = []): string {
	if (!nameArr[0]) {
		nameArr.shift();
	}

	return nameArr.reduce((prev, current) => {
		return `${prev}-${current}`;
	});
}
