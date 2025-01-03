import Logger from '../utils/Logger';
import UserManager from '../accessors/User';
import FileManager from './FileManager';
import GroupManager from '../accessors/Group';
import RecentlyViewedFileManager from '../accessors/RecentlyViewedFile';


export default class Client {
	logger: Logger;
	userManager: UserManager;
	groupManager: GroupManager;
	recentlyViewedFileManager: RecentlyViewedFileManager;
	FileManager: FileManager;

	constructor() {
		this.logger = new Logger();
		this.userManager = new UserManager();
		this.groupManager = new GroupManager();
		this.recentlyViewedFileManager = new RecentlyViewedFileManager();
		this.FileManager = new FileManager();
	}
}