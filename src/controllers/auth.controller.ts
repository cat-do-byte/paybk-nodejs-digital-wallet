import { Get, JsonController } from 'routing-controllers';

@JsonController('/')
export default class IndexController {
	@Get('/')
	async getCategories() {
		return 'categories';
	}
}
