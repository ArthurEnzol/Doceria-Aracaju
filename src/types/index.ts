export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagem: string;
}

export interface Doce {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: string;
  badge?: string;
}

export interface Pedido {
  id: string;
  cliente: string;
  dataEntrega: string;
  itens: CartItem[];
  totalPix: number;
  totalCartao: number;
  status: 'pendente' | 'preparando' | 'pronto' | 'entregue';
  dataPedido: string;
}
