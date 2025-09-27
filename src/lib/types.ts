export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageId: string;
};

export type Message = {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  component?: React.ReactNode;
};

export type DishDetails = {
    ingredients: string[];
    cookingProcess: string[];
};
