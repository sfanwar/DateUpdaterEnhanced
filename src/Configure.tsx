import * as React from 'react';

import { Button, Checkbox, DropdownSelect } from '@tableau/tableau-ui';

declare global {
    interface Window { tableau: any; }
}

export enum Dates {
    None = 'None',
    Today = 'Today',
    Yesterday = 'Yesterday',
    SevenDaysAgo = '7 Days ago',
    ThirtyDaysAgo = '30 Days ago',
}

export enum MinDates {
    None = 'None',
    Today = 'Today',
    Yesterday = 'Yesterday',
    SevenDaysAgo = '7 Days ago',
    ThirtyDaysAgo = '30 Days ago',
	Custom = 'Custom Date',
}

export enum MaxDates {
    None = 'None',
    Today = 'Today',
    Yesterday = 'Tomorrow',
    SevenDaysAgo = '7 Days later',
    ThirtyDaysAgo = '30 Days later',
	Custom = 'Custom Date',
}

const DateOptions: string[] = Object.keys(Dates).map(date => Dates[date]);

const MinDateOptions: string[] = Object.keys(MinDates).map(date => MinDates[date]);

const MaxDateOptions: string[] = Object.keys(MaxDates).map(date => MaxDates[date]);

interface Parameter {
	id:string;
    name: string;
    selectedDate: string;
	validationreqired:boolean;
	minvalidate:string;
	minvalidatecustom:string;
	maxvalidate:string;
	maxvalidatecustom:string;
}

interface State {
    adjust: boolean,
    configured: boolean;
    datepart: string;
    no_params: boolean;
    num: number;
    parameter: string;
    parameters: Parameter[];
}

function sortBy(prop: string) {
    return (a: any, b: any) => {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

// Container for all configurations
class Configure extends React.Component<any, any> {
    public readonly state: State = {
        adjust: false,
        configured: false,
        datepart: 'days',
        no_params: false,
        num: 0,
        parameter: '',
        parameters: [],
    };

    // Updates date parameter dropdowns
    public onDatePartChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLSelectElement>) => void) => {
        return (e: React.ChangeEvent<HTMLSelectElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.selectedDate = e.target.value;
                this.setState({ parameters });
            }
        }
    }
	
	 // Updates min date parameter dropdowns
    public onMinDatePartChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLSelectElement>) => void) => {
        return (e: React.ChangeEvent<HTMLSelectElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.minvalidate = e.target.value;
                this.setState({ parameters });
            }
        }
    }
	
	 // Updates min date custom parameter dropdowns
    public onMinDateCustomChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => {
        return (e: React.ChangeEvent<HTMLInputElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.minvalidatecustom = e.target.value;
                this.setState({ parameters });
            }
        }
    }
	
	// Updates max parameter dropdowns
    public onMaxDatePartChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLSelectElement>) => void) => {
        return (e: React.ChangeEvent<HTMLSelectElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.maxvalidate = e.target.value;
                this.setState({ parameters });
            }
        }
    }
	
	// Updates min date custom parameter dropdowns
    public onMaxDateCustomChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => {
        return (e: React.ChangeEvent<HTMLInputElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.maxvalidatecustom = e.target.value;
                this.setState({ parameters });
            }
        }
    }
	
	 // Updates parameter validation
	 public onValidationChangeWrapper = (parameterName: string): ((e: React.ChangeEvent<HTMLInputElement>) => void) => {
        return (e: React.ChangeEvent<HTMLInputElement>): void => {
            const parameters = this.state.parameters;
            const parameter = parameters.find((p: Parameter) => p.name === parameterName);
            if (parameter) {
                parameter.validationreqired = e.target.checked;
                this.setState({ parameters });
            }
        }
    }
    
    // Handles change in adjust for time zone checkbox
    public adjustChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ adjust: e.target.checked });
    };

    // Gets list of all open input date parameters
    public populateParams = (): void => {
        const settings = window.tableau.extensions.settings.getAll();
        window.tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((dashboardParameters: any) => {
            const parameters: Parameter[] = [];
            const configuredParameters = (settings.parameters) ? JSON.parse(settings.parameters) : [];
            for (const dashboardParameter of dashboardParameters) {
                let configuredParameter: any;
                if (settings.configured === 'true') {
                    configuredParameter = configuredParameters.find((parameter: any) => parameter.name === dashboardParameter.name);
                }
                if (dashboardParameter.allowableValues.type === 'all' && (dashboardParameter.dataType === 'date' || dashboardParameter.dataType === 'date-time')) {
                    const selectedDate: string = configuredParameter ? configuredParameter.selectedDate : Dates.None;
					const validationreqired: boolean = configuredParameter ? configuredParameter.validationreqired : false;
					const minvalidate: string = configuredParameter ? configuredParameter.minvalidate : MinDates.None;
					const maxvalidate: string = configuredParameter ? configuredParameter.maxvalidate : MaxDates.None;
					const minvalidatecustom: string = configuredParameter ? configuredParameter.minvalidatecustom : ' ';
					const maxvalidatecustom: string = configuredParameter ? configuredParameter.maxvalidatecustom : ' ';
					
					
                    parameters.push({
						id: dashboardParameter.id,
                        name: dashboardParameter.name,
                        selectedDate,
						validationreqired,
						minvalidate,
						minvalidatecustom,
						maxvalidate,
						maxvalidatecustom,
                    });
                }
            }

            parameters.sort(sortBy('name'));

            this.setState({
                no_params: Object.keys(parameters).length === 0,
                parameters,
            });
        });
    }

    // Saves settings and closes configure dialog with parameter payload
    public submit = (): void => {
        window.tableau.extensions.settings.set('configured', 'true');
        window.tableau.extensions.settings.set('parameters', JSON.stringify(this.state.parameters));
        window.tableau.extensions.settings.set('adjust', this.state.adjust);
        window.tableau.extensions.settings.saveAsync().then(() => {
            window.tableau.extensions.ui.closeDialog(this.state.parameter);
        });
    }

    // Once we have mounted, we call to initialize
    public componentWillMount() {
        window.tableau.extensions.initializeDialogAsync().then(() => {
            const settings = window.tableau.extensions.settings.getAll();
            if (settings.configured === 'true') {
                this.setState({
                    adjust: settings.adjust === 'true' || false,
                });
            }
            this.populateParams();
        });
    }

    public render() {
        return (
            <div className='container'>
                <div className='header'>
                    Date Updater Configuration
                </div>
                <div>
                    <p className='text'>Choose the date for the parameters you want to automatically update.</p>
                    <div className='scrolly'>
                    <p className='error' style={{display: (this.state.no_params === true) ? 'inline' : 'none'}}>No open input date parameters found.</p>
                        {this.state.parameters.map((p: Parameter) => (
                            <div className='dateset' key={`dataset-${p.name}`}>
                                <div className='pleft'>
                                    {p.name}
                                </div>
                                <div className='pright'>
                                <DropdownSelect className='dropdown-select' kind='line' onChange={this.onDatePartChangeWrapper(p.name)} onSelect={this.onDatePartChangeWrapper(p.name)} value={p.selectedDate}>
                                    {DateOptions.map((option: string) => <option key={option}>{option}</option>)}
                                </DropdownSelect>
                                </div>
								<div className='pright'>
									<Checkbox checked={p.validationreqired} onChange={this.onValidationChangeWrapper(p.name)}>Yes</Checkbox>
								</div>
								<div className='pright'>
								Min:
                                <DropdownSelect className='dropdown-select' kind='line' onChange={this.onMinDatePartChangeWrapper(p.name)} onSelect={this.onMinDatePartChangeWrapper(p.name)} value={p.minvalidate}>
                                    {MinDateOptions.map((option: string) => <option key={option}>{option}</option>)}
                                </DropdownSelect>
                                </div>
								<div className='pright'>
								Min Custom Date:
								<input type='text' value={p.minvalidatecustom} width={30} onChange={this.onMinDateCustomChangeWrapper(p.name)}/>
                                </div>
								<div className='pright'>
								Max:
                                <DropdownSelect className='dropdown-select' kind='line' onChange={this.onMaxDatePartChangeWrapper(p.name)} onSelect={this.onMaxDatePartChangeWrapper(p.name)} value={p.maxvalidate}>
                                    {MaxDateOptions.map((option: string) => <option key={option}>{option}</option>)}
                                </DropdownSelect>
                                </div>
								<div className='pright'>
								Max Custom Date:
								<input type='text' value={p.maxvalidatecustom} width={30} onChange={this.onMaxDateCustomChangeWrapper(p.name)}/>
                                </div>
                            </div>
                        ) )}
                    </div>
                </div>
                <div className='footer'>
                    <div className='btncluster'>
                    <Checkbox checked={this.state.adjust} onChange={this.adjustChange} style={{ width: '200px' }}>Adjust for timezone.</Checkbox>
                        <Button kind='filledGreen' onClick={this.submit}>OK</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Configure;