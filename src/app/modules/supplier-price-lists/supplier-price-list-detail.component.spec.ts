import{of}from'rxjs';import{SupplierPriceListDetailComponent}from'./supplier-price-list-detail.component';

describe('SupplierPriceListDetailComponent item filters',()=>{let api:any,component:SupplierPriceListDetailComponent;beforeEach(()=>{api={getItems:jasmine.createSpy('getItems')};component=new SupplierPriceListDetailComponent({snapshot:{paramMap:{get:()=> '9'}}}as any,api,{}as any,{}as any,{getAuthorities:()=>[],hasPermission:()=>false}as any);});
function load(filter:any,page={contenido:[],pagina:0,tamanio:20,totalElementos:0,totalPaginas:0}){api.getItems.and.returnValue(of(page));component.filter=filter;component.loadItems();return api.getItems.calls.mostRecent().args[1];}
it('omits every inactive filter for Todos',()=>{expect(load('ALL')).toEqual({search:undefined,page:0,size:20});});
it('sends only matched=true for Reconocidos',()=>expect(load('MATCHED')).toEqual({search:undefined,page:0,size:20,matched:true}));
it('sends only matched=false for Sin reconocer',()=>expect(load('UNMATCHED')).toEqual({search:undefined,page:0,size:20,matched:false}));
it('sends only the selected price comparison filter',()=>{expect(load('INCREASE').increaseOnly).toBeTrue();expect(load('DECREASE').decreaseOnly).toBeTrue();expect(load('BEST').betterThanCurrentBest).toBeTrue();});
it('keeps backend content and total for table and paginator',()=>{const page={contenido:Array.from({length:20},(_,id)=>({id})),pagina:0,tamanio:20,totalElementos:437,totalPaginas:22}as any;load('ALL',page);expect(component.items?.contenido.length).toBe(20);expect(component.items?.totalElementos).toBe(437);});});
