import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { Modal } from 'react-native';

import { ModalContainer, ModalText } from './styles';

interface OrderCompletedProps {
  show: boolean;
}

const OrderCompleted: React.FC<OrderCompletedProps> = ({ show }) => {
  return (
    <Modal visible={show} transparent animationType="slide">
      <ModalContainer>
        <Icon name="thumbs-up" size={80} color="#39B100" />

        <ModalText>Pedido confirmado!</ModalText>
      </ModalContainer>
    </Modal>
  );
};

export default OrderCompleted;
