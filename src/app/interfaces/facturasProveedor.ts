export interface facturasProveedor{
	id: number;
	idInvoice: string;
	dueDate: string;
	payDay?: any;
	providerName: string;
	payamentStatus: boolean;
	amount: number;
	saldoPendiente: number;
	montoTotal: number;
	pagoList: any[];
	dateOfEntry: string;
}