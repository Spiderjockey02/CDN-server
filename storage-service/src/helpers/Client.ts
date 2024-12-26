import Logger from '../utils/Logger';
import UserManager from '../accessors/User';
import FileManager from './FileManager';
import GroupManager from '../accessors/Group';


export default class Client {
	logger: Logger;
	userManager: UserManager;
	groupManager: GroupManager;
	FileManager: FileManager;

	constructor() {
		this.logger = new Logger();
		this.userManager = new UserManager();
		this.groupManager = new GroupManager();
		this.FileManager = new FileManager();
	}
}