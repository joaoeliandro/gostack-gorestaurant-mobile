import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import OrderCompleted from '../../components/OrderCompleted';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [showModal, setShowModal] = useState(false);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;
  const { id } = routeParams;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const response = await api.get<Food>(`foods/${id}`);
      setFood({
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      });

      setExtras(
        response.data.extras.map(extra => ({
          ...extra,
          quantity: 0,
        })),
      );
    }

    loadFood();
  }, [id]);

  useEffect(() => {
    api.get('favorites').then(response => {
      const isSavedFavorite = response.data.some(
        (favorite: Food) => favorite.id === id,
      );

      setIsFavorite(isSavedFavorite);
    });
  }, [setIsFavorite, id]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const updatedExtras = [...extras];
    const extraToUpdate = updatedExtras.find(el => el.id === id);
    if (extraToUpdate) {
      extraToUpdate.quantity += 1;
      setExtras(updatedExtras);
    }
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const updatedExtras = [...extras];
    const extraToUpdate = updatedExtras.find(el => el.id === id);
    if (extraToUpdate) {
      extraToUpdate.quantity -= 1;
      if (extraToUpdate.quantity < 0) {
        return;
      }
      setExtras(updatedExtras);
    }
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    setFoodQuantity(foodQuantity + 1);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    const newQuantity = foodQuantity - 1;
    if (newQuantity < 1) {
      return;
    }
    setFoodQuantity(newQuantity);
  }

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not
    if (isFavorite) {
      await api.delete(`favorites/${id}`).catch(err => {
        console.log('erro no delete', err);
      });
      setIsFavorite(false);
    } else {
      await api.post('favorites', { ...food, extras: undefined });
      setIsFavorite(true);
    }
  }, [isFavorite, food, id]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal
    const totalExtras = extras.reduce((acm, curr) => {
      return acm + curr.quantity * curr.value;
    }, 0);

    const totalFoods = food.price * foodQuantity;

    return formatValue(totalExtras + totalFoods);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
    api
      .post('orders', {
        ...food,
        id: undefined,
        quantity: foodQuantity,
        extras: extras.filter(el => el.quantity > 0),
      })
      .then(() => {
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigation.navigate('MainBottom');
        }, 2000);
      });
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <>
      <OrderCompleted show={showModal} />

      <Container>
        <Header />

        <ScrollContainer>
          <FoodsContainer>
            <Food>
              <FoodImageContainer>
                <Image
                  style={{ width: 327, height: 183 }}
                  source={{
                    uri: food.image_url,
                  }}
                />
              </FoodImageContainer>
              <FoodContent>
                <FoodTitle>{food.name}</FoodTitle>
                <FoodDescription>{food.description}</FoodDescription>
                <FoodPricing>{food.formattedPrice}</FoodPricing>
              </FoodContent>
            </Food>
          </FoodsContainer>
          <AdditionalsContainer>
            <Title>Adicionais</Title>
            {extras.map(extra => (
              <AdittionalItem key={extra.id}>
                <AdittionalItemText>{extra.name}</AdittionalItemText>
                <AdittionalQuantity>
                  <Icon
                    size={15}
                    color="#6C6C80"
                    name="minus"
                    onPress={() => handleDecrementExtra(extra.id)}
                    testID={`decrement-extra-${extra.id}`}
                  />
                  <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                    {extra.quantity}
                  </AdittionalItemText>
                  <Icon
                    size={15}
                    color="#6C6C80"
                    name="plus"
                    onPress={() => handleIncrementExtra(extra.id)}
                    testID={`increment-extra-${extra.id}`}
                  />
                </AdittionalQuantity>
              </AdittionalItem>
            ))}
          </AdditionalsContainer>
          <TotalContainer>
            <Title>Total do pedido</Title>
            <PriceButtonContainer>
              <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
              <QuantityContainer>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={handleDecrementFood}
                  testID="decrement-food"
                />
                <AdittionalItemText testID="food-quantity">
                  {foodQuantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={handleIncrementFood}
                  testID="increment-food"
                />
              </QuantityContainer>
            </PriceButtonContainer>

            <FinishOrderButton onPress={() => handleFinishOrder()}>
              <ButtonText>Confirmar pedido</ButtonText>
              <IconContainer>
                <Icon name="check-square" size={24} color="#fff" />
              </IconContainer>
            </FinishOrderButton>
          </TotalContainer>
        </ScrollContainer>
      </Container>
    </>
  );
};

export default FoodDetails;
