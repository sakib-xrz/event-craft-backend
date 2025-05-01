type TRole = 'ADMIN' | 'USER';

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  full_name: string;
  email: string;
  password: string;
  role: TRole;
  phone: string;
  address?: string;
  image_url?: string;
}
