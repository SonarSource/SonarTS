import * as React from "react";
import * as _ from "lodash";

interface LocaleSelectorProps extends React.ClassAttributes<LocaleSelector> {
	locale: string;
	selectLocale: (locale: string, loaded?: () => void) => void;
	disabled?: boolean;
}

interface LocaleSelectorState {
	loading?: boolean;
}

export default class LocaleSelector extends React.Component<LocaleSelectorProps, LocaleSelectorState> {

	constructor(props: LocaleSelectorProps, context: any) {
		super(props, context);
		this.state = {
			loading: false,
		};
	}

	protected changeLocale(e: any): void {
		const locale = e.target.value;
		this.setState({loading: true});
		this.props.selectLocale(locale, () => {
			this.setState({loading: false});
		});
	}

	public render(): JSX.Element {
		const available = {
			"enUS": "English",
			"zhTW": "Chinese (TW)",
			"zhCN": "Chinese (CN)",
			"frFR": "French",
			"deDE": "German",
			"itIT": "Italian",
			"jaJP": "Japanese",
			"koKR": "Korean",
			"plPL": "Polish",
			"ptBR": "Portuguese",
			"ruRU": "Russian",
			"esES": "Spanish (ES)",
			"esMX": "Spanish (MX)",
			"thTH": "Thai",
		};

		let locales = _.map(available, (name: string, key: string) => {
			return <option key={key} value={key}>{name}</option>;
		});

		return (
			<select
				onChange={(e) => this.changeLocale(e)}
				value={this.props.locale}
				disabled={this.props.disabled || this.state.loading}>
				{locales}
			</select>
		);

	}
}
