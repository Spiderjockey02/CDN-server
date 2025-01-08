export const PATHS = {
	AVATAR: `${process.cwd()}/src/uploads/avatars`,
	THUMBNAIL: `${process.cwd()}/src/uploads/thumbnails`,
	CONTENT: `${process.cwd()}/src/uploads/content`,
	TRASH: `${process.cwd()}/src/uploads/trash`,
};

export const ipRegex = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(\.(?!$)|$)){4}$|^(([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}|::(?:ffff:(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(\.\d{1,3}){3})?)$/;