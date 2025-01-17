import imageThumbnail from 'image-thumbnail';
import fs, { readdirSync, statSync } from 'fs';
import { PATHS } from './CONSTANTS';
import { join, parse, sep } from 'path';

interface FileOptions {
	path: string,
	route: string,
}

export function generateRoutes(directory: string) {
	const seperator = '/';
	const results: FileOptions[] = [];
	for(const path of searchDirectory(directory)) {
		const { dir, name } = parse(path);
		const basePath = directory.split(sep).pop() as string;
		const dirIndex = dir.indexOf(basePath);
		const directoryRoute = dir.slice(dirIndex).split(sep).join(seperator).toString().replace(basePath, !basePath.startsWith(seperator) ? '' : seperator);
		results.push({ path, route: `${validateDynamicRoute(directoryRoute)}${validateDynamicRoute(name, true)}` });
	}
	return results;
}

export function validateDynamicRoute(context: string, isFile = false) {
	const seperator = '/';
	const dynamicRouteValidator = /(?<=\[).+?(?=\])/gi;
	const validate = (dynamicRouteValidator.exec(context));
	if(!validate) return isFile ? `${seperator}${context}` : context;
	return context.replace(`[${validate[0]}]`, isFile ? `${seperator}:${validate[0]}` : `:${validate[0]}`);
}

export function searchDirectory(directory: string, files: string[] = []) {
	for(const file of readdirSync(directory)) {
		const path = join(directory, file);
		const is = statSync(path);
		if(is.isFile()) files.push(path);
		if(is.isDirectory()) files = files.concat(searchDirectory(path));
	}
	return files;
}


export async function createThumbnail(userId: string, path: string) {
	// @ts-ignore Broken types on this package
	const thumbnail = await imageThumbnail(`${PATHS.CONTENT}/${userId}/${path}`, { responseType: 'buffer', width: 400, height: 520, fit: 'cover' });
	fs.writeFileSync(`${PATHS.THUMBNAIL}/${userId}/${path.substring(0, path.lastIndexOf('.')) || path}.jpg`, thumbnail);
}

export function sanitiseObject(obj: any) {
	return JSON.parse(JSON.stringify(obj, (_, value) =>
		typeof value === 'bigint' ? Number(value) : value,
	));
}
