import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';

import { useIsFocused } from '@react-navigation/native';
import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  HeaderTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedValue: number;
  totalOrderValue: number;
  thumbnail_url: string;
  extras: Extra[];
  quantity: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Food[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    async function loadOrders(): Promise<void> {
      // Load orders from API
      api.get<Food[]>('orders').then(response => {
        const formattedOrders = response.data.map(food => {
          const totalExtras = food.extras.reduce((acm, curr) => {
            return acm + curr.quantity * curr.value;
          }, 0);

          const totalFoods = food.price * food.quantity;

          const totalOrderValue = totalExtras + totalFoods;
          console.log(food.price, food.quantity);

          return {
            ...food,
            totalOrderValue: formatValue(totalOrderValue),
            formattedPrice: formatValue(food.price),
          };
        });

        setOrders(formattedOrders);
      });
    }

    loadOrders();
  }, [isFocused]);

  return (
    <Container>
      <Header>
        <HeaderTitle>Meus pedidos</HeaderTitle>
      </Header>

      <FoodsContainer>
        <FoodList
          data={orders}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Food key={item.id} activeOpacity={0.6}>
              <FoodImageContainer>
                <Image
                  style={{ width: 88, height: 88 }}
                  source={{ uri: item.thumbnail_url }}
                />
              </FoodImageContainer>
              <FoodContent>
                <FoodTitle>{item.name}</FoodTitle>
                <FoodDescription>{item.description}</FoodDescription>
                <FoodPricing>{item.totalOrderValue}</FoodPricing>
              </FoodContent>
            </Food>
          )}
        />
      </FoodsContainer>
    </Container>
  );
};

export default Orders;
