import picocolors from "picocolors";

const { red, yellow } = picocolors;
import { snakeToCamel, toCapitalize } from "./utils";

export type IResult = Record<
	string,
	Record<
		string,
		{
			url: string | undefined;
			method: string | undefined;
			req?: string | undefined;
			res: string | undefined;
		}
	>
>;

export class ApiParser {
	private pageReg: RegExp;
	private urlReg: RegExp;
	private methodReg: RegExp;
	private reqReg: RegExp;
	private resReg: RegExp;
	private apiReg: RegExp;
	private pageSource: Map<string, string | undefined>;

	constructor() {
		this.pageReg = /##\s*page[：|:]*\s*(.+)/gm;
		this.apiReg = /^##\s+(.+)/gm;
		this.urlReg = /###\s+URL[：|:]*\s+([\s\S]*?)(?=###)/;
		this.methodReg = /###\s+请求方式[：|:]*\s+([\s\S]*?)(?=###)/;
		this.reqReg =
			/###\s+请求参数[：|:]*\s+[\s\S]*?```\s*json\s+([\s\S]*?)(?=```)/;
		this.resReg = /###\s+返回参数[：|:]*[\s\S]*?```\s*json\s+([\s\S]*?)(?=```)/;

		this.pageSource = new Map();
	}

	dividePage(resource: string) {
		const page: string[] = [];

		let match: RegExpExecArray | null;

		while ((match = this.pageReg.exec(resource)) !== null) {
			const title = match[1];
			page.push(title);
		}

		if (page.length === 0) {
			console.log(
				`${red("error:")} cannot find split symbol ${yellow(
					"## page: xxx",
				)} in your api.md`,
			);
			process.exit(1);
		}

		page.reduce((prev, current, index) => {
			const pageBlockReg = new RegExp(
				`##\\s+page[:|：]\\s*${prev}([\\s\\S]*?)^##\\s+page[:|：]\\s*${current}`,
				"gm",
			);
			this.pageSource.set(page[index - 1], pageBlockReg.exec(resource)?.[1]);
			return current;
		});

		const pageBlockReg = new RegExp(
			`##\\s+page[:|：]\\s*${page[page.length - 1]}([\\s\\S]*)`,
		);

		this.pageSource.set(
			page[page.length - 1],
			pageBlockReg.exec(resource)?.[1],
		);
	}

	divideApi(resource: string) {
		const api: string[] = [];
		const apiRes: Record<string, string | undefined> = {};
		let match: RegExpExecArray | null;
		while ((match = this.apiReg.exec(resource)) !== null) {
			const title = match[1];
			api.push(title);
		}
		api.length &&
			api.reduce((prev, current, index) => {
				const apiBlockReg = new RegExp(
					`##\\s+${prev}([\\s\\S]*?)^##\\s+${current}`,
					"gm",
				);

				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				apiRes[api[index - 1]!] = apiBlockReg.exec(resource)?.[1];
				return current;
			});

		const apiBlockReg = new RegExp(`##\\s+${api[api.length - 1]}([\\s\\S]*)`);

		apiRes[api[api.length - 1]] = apiBlockReg.exec(resource)?.[1];

		return apiRes;
	}

	parse(resource: string) {
		this.dividePage(resource);

		const result: IResult = {};

		for (const page of this.pageSource.keys()) {
			const apiRes = this.divideApi(this.pageSource.get(page) || "");
			result[page] = {};
			for (const api of Object.values(apiRes)) {
				if (api) {
					const url = this.urlReg.exec(api)?.[1].trim();

					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					const spiltUrl = url?.split("/")!;

					const method = this.methodReg
						.exec(api)?.[1]
						.trim()
						.toLocaleLowerCase();

					const apiName = `${snakeToCamel(
						spiltUrl[spiltUrl?.length - 1],
					)}${toCapitalize(method)}`;

					const req = this.reqReg.exec(api)?.[1].trim();
					const res = this.resReg.exec(api)?.[1].trim();

					result[page][apiName] = {
						method,
						url,
						req,
						res,
					};

					if (req) {
						result[page][apiName].req = req;
					}
				}
			}
		}
		return result;
	}
}
