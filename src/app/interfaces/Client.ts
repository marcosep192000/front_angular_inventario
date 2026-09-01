import { CtaCte } from "./CtaCte";

export interface Client {
    id: number;
    cuit: string; 
	name: string;
	lastName?: string;
	address: string;
	tel: string;
	telefono?: string;
	phone?: string;
	email: string;
	initialDate?: any;
	time?: any;
	status: boolean;
	cuentaCorriente?: CtaCte;	
	condicionIva?: 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTISTA' | 'EXENTO' | 'CONSUMIDOR_FINAL' | 'NO_ALCANZADO' | 'NO_CATEGORIZADO';
}


