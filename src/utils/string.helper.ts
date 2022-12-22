const omit = (obj: object, exludes: string[]): object => {
	const excludeKeys = new Set(exludes);
	return Object.fromEntries(Object.entries(obj).filter(([key]) => !excludeKeys.has(key)));
};

export { omit };
